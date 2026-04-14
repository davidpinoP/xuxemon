<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DailyRewardService;

class DeliverDailyRewards extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'game:deliver-rewards';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reparte 10 xuxes y 1 xuxemon pequeno a la hora configurada';

    /**
     * Execute the console command.
     */
    public function handle(DailyRewardService $dailyRewardService)
    {
        $now = now();
        $rewardHour = $dailyRewardService->getRewardHour();
        
        // Comprobar si es después de la hora configurada
        if ($now->hour < $rewardHour) {
            $this->info('Aun no es la hora configurada. No se repartiran recompensas.');
            return 0;
        }

        // Buscar usuarios que no hayan recibido el premio hoy
        $users = \App\Models\User::where(function ($query) use ($now) {
            $query->whereNull('last_reward_at')
                  ->orWhereDate('last_reward_at', '<', $now->toDateString());
        })->get();

        if ($users->isEmpty()) {
            $this->info('Todos los usuarios ya tienen su premio de hoy.');
            return 0;
        }

        $this->info('Repartiendo premios a ' . $users->count() . ' usuarios...');

        foreach ($users as $user) {
            $dailyRewardService->grantIfEligible($user, $now);
        }

        $this->info('Proceso completado.');
        return 0;
    }
}
