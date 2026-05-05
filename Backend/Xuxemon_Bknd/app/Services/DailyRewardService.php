<?php

namespace App\Services;

use App\Models\Config;
use App\Models\User;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use Carbon\Carbon;

class DailyRewardService
{
    private const XUXE_TYPES = [
        'Xuxe Caramelo',
        'Xuxe CHOCO',
        'Xuxe Menta',
    ];

    /**
     * Sistema "Lazy Claim" (Reclamo Diferido).
     * En lugar de usar un Cron Job pesado que colapse el servidor a las 8 AM,
     * comprobamos dinámicamente si el jugador tiene derecho a premio al conectarse.
     */
    public function canClaim(User $user, ?Carbon $now = null): bool
    {
        // PASO 1: Establecer la hora actual (por defecto la del sistema)
        $now = $now ?: now();
        
        // PASO 2: Leer la hora de recompensa desde la base de datos (configurada por Admin)
        $rewardHour = $this->getRewardHour();

        // PASO 3: Validación de la hora. Si son antes de las 8 AM (o la hora configurada), se rechaza.
        if ($now->hour < $rewardHour) {
            return false;
        }

        // PASO 4: Validación de cobro único por día. Si ya lo cobró "hoy" (isToday), se rechaza.
        if ($user->last_reward_at && $user->last_reward_at->isToday()) {
            return false;
        }

        // Si supera ambas barreras, significa que es apto para recibir su recompensa diaria.
        return true;
    }

    public function grantIfEligible(User $user, ?Carbon $now = null): ?array
    {
        $now = $now ?: now();

        if (!$this->canClaim($user, $now)) {
            return null;
        }

        return $this->grant($user, $now);
    }

    public function grant(User $user, ?Carbon $now = null): array
    {
        $now = $now ?: now();

        // PASO 1: Doble comprobación de seguridad (por si alguien llama directamente a la API)
        if (!$this->canClaim($user, $now)) {
            return [
                'ok' => false,
                'message' => 'No puedes reclamar la recompensa en este momento.'
            ];
        }

        // ==========================================
        // PARTE 1: ENTREGA DE XUXES
        // ==========================================
        // Leemos la cantidad de la base de datos (Configuración de Admin)
        $xuxes = $this->getRewardXuxesAmount();
        $rewardXuxeName = $this->pickRandomXuxeName();

        // Comprobamos si el usuario ya tiene este tipo de xuxe en su mochila
        $xuxeEntry = $user->mochila()
            ->where('tipo', 'item')
            ->where('nombre', $rewardXuxeName)
            ->first();
            
        if ($xuxeEntry) {
            // Si ya la tiene, solo incrementamos la cantidad
            $xuxeEntry->increment('cantidad', $xuxes);
        } else {
            // Si no la tiene, creamos un nuevo bloque/hueco en la mochila
            $user->mochila()->create([
                'nombre' => $rewardXuxeName,
                'tipo' => 'item',
                'cantidad' => $xuxes
            ]);
        }

        // ==========================================
        // PARTE 2: ENTREGA DEL XUXEMON ALEATORIO
        // ==========================================
        $xuxemonAlea = $this->obtenerXuxemonAleatorioParaUsuario($user);
        $xuxemonNombre = null;
        $xuxemonId = null;

        if ($xuxemonAlea) {
            $xuxemonNombre = $xuxemonAlea->nombre;
            $xuxemonId = $xuxemonAlea->id;

            // Buscamos si ya tiene este Xuxemon en la mochila, si no, preparamos para crearlo
            $entradaMochila = $user->mochila()->firstOrNew([
                'nombre' => $xuxemonAlea->nombre,
                'tipo' => 'xuxemon',
            ]);

            // Añadimos +1 a la cantidad en la mochila y lo forzamos a nacer "Pequeño"
            $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
            $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeño';
            $entradaMochila->save();

            // Lo registramos en la colección (UserXuxemon) o en la "Xuxedex"
            // firstOrCreate evita crear duplicados en la Xuxedex si ya lo tenía,
            // pero inicializa sus stats (comidas, enfermedades) si es la primera vez.
            UserXuxemon::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'xuxemon_id' => $xuxemonAlea->id,
                ],
                [
                    'tamano' => 'Pequeño',
                    'comidas' => 0,
                    'imagen' => $xuxemonAlea->imagen,
                    'enfermedad' => null,
                    'enfermedades' => [],
                ]
            );
        }

        // ==========================================
        // PARTE 3: MARCAR COMO COBRADO
        // ==========================================
        // Actualizamos la fecha de último cobro para que no pueda volver a cobrar hoy
        $user->last_reward_at = $now;
        $user->save();

        // Retornamos los datos para mostrarlos en el frontend modal
        return [
            'ok' => true,
            'xuxes' => $xuxes,
            'xuxe_name' => $rewardXuxeName,
            'xuxemon' => $xuxemonNombre,
            'xuxemon_id' => $xuxemonId,
            'reward_hour' => $this->getRewardHour(),
        ];
    }

    public function getRewardHour(): int
    {
        $rewardHour = Config::getInt('reward_hour', 8);

        if ($rewardHour < 0) {
            return 0;
        }

        if ($rewardHour > 23) {
            return 23;
        }

        return $rewardHour;
    }

    public function getRewardXuxesAmount(): int
    {
        $amount = Config::getInt('reward_xuxes_amount', 10);

        return $amount > 0 ? $amount : 10;
    }

    /**
     * Selecciona un Xuxemon aleatorio, priorizando los que el usuario AÚN NO TIENE.
     * Si ya los tiene todos, devuelve uno aleatorio repetido.
     */
    private function obtenerXuxemonAleatorioParaUsuario(User $user): ?Xuxemon
    {
        $desbloqueados = UserXuxemon::where('user_id', $user->id)
            ->pluck('xuxemon_id');

        $pendiente = Xuxemon::query()
            ->when($desbloqueados->isNotEmpty(), function ($query) use ($desbloqueados) {
                $query->whereNotIn('id', $desbloqueados);
            })
            ->inRandomOrder()
            ->first();

        return $pendiente ?: Xuxemon::inRandomOrder()->first();
    }

    private function pickRandomXuxeName(): string
    {
        return self::XUXE_TYPES[array_rand(self::XUXE_TYPES)];
    }
}
