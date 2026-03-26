<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

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
    protected $description = 'Reparte 10 xuxes y 1 xuxemon aleatorio a las 08:00 AM';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();
        
        // Comprobar si es después de las 08:00 AM
        if ($now->hour < 8) {
            $this->info('Aún no son las 08:00 AM. No se repartirán recompensas.');
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
            // 1. Dar 10 Xuxes (Asegurar que existe el item o usar el nombre)
            $xuxeEntry = $user->mochila()->where('nombre', 'Xuxe')->first();
            if ($xuxeEntry) {
                $xuxeEntry->increment('cantidad', 10);
            } else {
                $user->mochila()->create([
                    'nombre' => 'Xuxe',
                    'tipo' => 'item',
                    'cantidad' => 10
                ]);
            }

            // 2. Dar Xuxemon Aleatorio Pequeño
            $xuxemonAlea = \App\Models\Xuxemon::inRandomOrder()->first();
            if ($xuxemonAlea) {
                $user->mochila()->create([
                    'nombre' => $xuxemonAlea->nombre,
                    'tipo' => 'xuxemon',
                    'tamano' => 'Pequeño',
                    'cantidad' => 1
                ]);
            }

            // 3. Actualizar fecha de la última recompensa
            $user->last_reward_at = $now;
            $user->save();
        }

        $this->info('Proceso completado.');
        return 0;
    }
}
