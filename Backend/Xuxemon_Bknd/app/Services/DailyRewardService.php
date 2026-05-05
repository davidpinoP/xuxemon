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
        $now = $now ?: now();
        $rewardHour = $this->getRewardHour(); // Obtenemos la hora configurada por el admin desde la BD
        
        if ($now->hour < $rewardHour) {
            return false; // Aún no es la hora permitida para reclamar el premio
        }

        if ($user->last_reward_at && $user->last_reward_at->isToday()) {
            return false; // Evitamos duplicados: ya ha cobrado su premio hoy
        }

        return true; // Ha pasado todos los filtros, puede cobrar
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

        if (!$this->canClaim($user, $now)) {
            return [
                'ok' => false,
                'message' => 'No puedes reclamar la recompensa en este momento.'
            ];
        }

        // 1. Entregar Xuxes dinámicas
        // Leemos cuántas xuxes tocan desde la configuración del admin
        $xuxes = $this->getRewardXuxesAmount();
        $rewardXuxeName = $this->pickRandomXuxeName();

        $xuxeEntry = $user->mochila()
            ->where('tipo', 'item')
            ->where('nombre', $rewardXuxeName)
            ->first();
            
        if ($xuxeEntry) {
            $xuxeEntry->increment('cantidad', $xuxes); // Si ya tiene de esta xuxe, le sumamos la cantidad
        } else {
            $user->mochila()->create([
                'nombre' => $rewardXuxeName,
                'tipo' => 'item',
                'cantidad' => $xuxes // Si es nueva, le creamos el hueco en la mochila
            ]);
        }

        // 2. Entregar Xuxemon
        // Usa una query que intenta buscar Xuxemons que el usuario aún NO tenga desbloqueados
        $xuxemonAlea = $this->obtenerXuxemonAleatorioParaUsuario($user);
        $xuxemonNombre = null;
        $xuxemonId = null;

        if ($xuxemonAlea) {
            $xuxemonNombre = $xuxemonAlea->nombre;
            $xuxemonId = $xuxemonAlea->id;

            $entradaMochila = $user->mochila()->firstOrNew([
                'nombre' => $xuxemonAlea->nombre,
                'tipo' => 'xuxemon',
            ]);

            // Lo metemos en la mochila, garantizando que entra con tamaño "Pequeño"
            $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
            $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeño';
            $entradaMochila->save();

            // 3. Registrar en la Xuxedex (UserXuxemon)
            // firstOrCreate inicializa las estadísticas (comidas, enfermedades) a 0 si es la primera vez que lo atrapa
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

        // 4. Registrar cobro
        // Guardamos la fecha actual en la BD para bloquear futuros reclamos hasta mañana
        $user->last_reward_at = $now;
        $user->save();

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
