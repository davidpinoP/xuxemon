<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configs = [
            'spawn_rate' => '0.05',
            'reward_coins_min' => '10',
            'reward_coins_max' => '50',
            'max_inventory_slots' => '20',
            'xuxe_evolution_level' => '10',
        ];

        foreach ($configs as $key => $value) {
            \App\Models\Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
