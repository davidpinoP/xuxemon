<?php

namespace App\Services;

use App\Models\Config;
use App\Models\User;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use Carbon\Carbon;

class DailyRewardService
{
    public function canClaim(User $user, ?Carbon $now = null): bool
    {
        $now = $now ?: now();
        $rewardHour = $this->getRewardHour();

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

        $xuxes = $this->getRewardXuxesAmount();

        $xuxeEntry = $user->mochila()->where('nombre', 'Xuxe')->first();
        if ($xuxeEntry) {
            $xuxeEntry->increment('cantidad', $xuxes);
        } else {
            $user->mochila()->create([
                'nombre' => 'Xuxe',
                'tipo' => 'item',
                'cantidad' => $xuxes
            ]);
        }

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

            $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
            $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeno';
            $entradaMochila->save();

            UserXuxemon::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'xuxemon_id' => $xuxemonAlea->id,
                ],
                [
                    'tamano' => 'Pequeno',
                    'comidas' => 0,
                    'imagen' => $xuxemonAlea->imagen,
                    'enfermedad' => null,
                ]
            );
        }

        $user->last_reward_at = $now;
        $user->save();

        return [
            'ok' => true,
            'xuxes' => $xuxes,
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
}
