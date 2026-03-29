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

        $xuxes = 10;

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

        $xuxemonAlea = Xuxemon::inRandomOrder()->first();
        $xuxemonNombre = null;
        $xuxemonId = null;

        if ($xuxemonAlea) {
            $xuxemonNombre = $xuxemonAlea->nombre;
            $xuxemonId = $xuxemonAlea->id;

            $user->mochila()->create([
                'nombre' => $xuxemonAlea->nombre,
                'tipo' => 'xuxemon',
                'tamano' => 'Pequeño',
                'cantidad' => 1
            ]);

            UserXuxemon::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'xuxemon_id' => $xuxemonAlea->id,
                ],
                [
                    'tamano' => 'Pequeño',
                    'comidas' => 0,
                    'imagen' => $xuxemonAlea->imagen,
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
}
