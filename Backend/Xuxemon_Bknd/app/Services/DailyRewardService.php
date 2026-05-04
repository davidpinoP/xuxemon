<?php

namespace App\Services;

use App\Models\Config;
use App\Models\User;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DailyRewardService
{
    // Tipos de xuxe que se pueden regalar de forma aleatoria en la recompensa diaria.
    private const XUXE_TYPES = [
        'Xuxe Caramelo',
        'Xuxe CHOCO',
        'Xuxe Menta',
    ];

    public function canClaim(User $user, ?Carbon $now = null): bool
    {
        $now = $now ?: now();
        $rewardHour = $this->getRewardHour();

        // Solo se puede reclamar si ya paso la hora configurada y no la ha cobrado hoy.
        if ($now->hour < $rewardHour) {
            return false;
        }

        if ($user->last_reward_at && $user->last_reward_at->isToday()) {
            return false;
        }

        return true;
    }

    public function grantIfEligible(User $user, ?Carbon $now = null): ?array
    {
        $now = $now ?: now();

        // Este helper se usa cuando queremos dar la recompensa automaticamente si corresponde,
        // por ejemplo al iniciar sesion o al comprobar estados del usuario.
        if (!$this->canClaim($user, $now)) {
            return null;
        }

        return $this->grant($user, $now);
    }

    public function grant(User $user, ?Carbon $now = null): array
    {
        $now = $now ?: now();

        return DB::transaction(function () use ($user, $now) {
            $lockedUser = User::query()
                ->whereKey($user->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if (!$this->canClaim($lockedUser, $now)) {
                return [
                    'ok' => false,
                    'message' => 'No puedes reclamar la recompensa en este momento.'
                ];
            }

            $xuxes = $this->getRewardXuxesAmount();
            $rewardXuxeName = $this->pickRandomXuxeName();

            $xuxeEntry = $lockedUser->mochila()
                ->where('tipo', 'item')
                ->where('nombre', $rewardXuxeName)
                ->first();

            if ($xuxeEntry) {
                $xuxeEntry->increment('cantidad', $xuxes);
            } else {
                $lockedUser->mochila()->create([
                    'nombre' => $rewardXuxeName,
                    'tipo' => 'item',
                    'cantidad' => $xuxes
                ]);
            }

            $xuxemonAlea = $this->obtenerXuxemonAleatorioParaUsuario($lockedUser);
            $xuxemonNombre = null;
            $xuxemonId = null;

            if ($xuxemonAlea) {
                $xuxemonNombre = $xuxemonAlea->nombre;
                $xuxemonId = $xuxemonAlea->id;

                $entradaMochila = $lockedUser->mochila()->firstOrNew([
                    'nombre' => $xuxemonAlea->nombre,
                    'tipo' => 'xuxemon',
                ]);

                $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
                $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeño';
                $entradaMochila->save();

                UserXuxemon::firstOrCreate(
                    [
                        'user_id' => $lockedUser->id,
                        'xuxemon_id' => $xuxemonAlea->id,
                    ],
                    UserXuxemon::initialAttributesFor($xuxemonAlea)
                );
            }

            $lockedUser->last_reward_at = $now;
            $lockedUser->save();

            return [
                'ok' => true,
                'xuxes' => $xuxes,
                'xuxe_name' => $rewardXuxeName,
                'xuxemon' => $xuxemonNombre,
                'xuxemon_id' => $xuxemonId,
                'reward_hour' => $this->getRewardHour(),
            ];
<<<<<<< Updated upstream
        }

        // La recompensa diaria combina xuxes y un Xuxemon aleatorio pequeno.
        $xuxes = $this->getRewardXuxesAmount();
        $rewardXuxeName = $this->pickRandomXuxeName();

        // Primero regalamos las xuxes diarias como item normal de mochila.
        $xuxeEntry = $user->mochila()
            ->where('tipo', 'item')
            ->where('nombre', $rewardXuxeName)
            ->first();
        if ($xuxeEntry) {
            $xuxeEntry->increment('cantidad', $xuxes);
        } else {
            $user->mochila()->create([
                'nombre' => $rewardXuxeName,
                'tipo' => 'item',
                'cantidad' => $xuxes
            ]);
        }

        $xuxemonAlea = $this->obtenerXuxemonAleatorioParaUsuario($user);
        $xuxemonNombre = null;
        $xuxemonId = null;

        if ($xuxemonAlea) {
            // Despues regalamos un Xuxemon pequeno y lo sincronizamos tambien en user_xuxemons.
            $xuxemonNombre = $xuxemonAlea->nombre;
            $xuxemonId = $xuxemonAlea->id;

            $entradaMochila = $user->mochila()->firstOrNew([
                'nombre' => $xuxemonAlea->nombre,
                'tipo' => 'xuxemon',
            ]);

            $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
            $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeño';
            $entradaMochila->save();

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
=======
        });
>>>>>>> Stashed changes
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
        // Esta cantidad sale de la configuracion global del admin, no esta hardcodeada.
        $amount = Config::getInt('reward_xuxes_amount', 10);

        return $amount > 0 ? $amount : 10;
    }

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
        // Elegimos un tipo de xuxe al azar para que la recompensa no sea siempre identica.
        return self::XUXE_TYPES[array_rand(self::XUXE_TYPES)];
    }
}
