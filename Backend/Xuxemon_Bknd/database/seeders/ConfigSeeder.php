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
            'pct_bajon_azucar' => '5',
            'pct_sobredosis_sucre' => '10',
            'pct_atracon' => '15',
            'evolve_xuxes' => '3',
            'reward_hour' => '8',
            'reward_xuxes_amount' => '10',
        ];

        foreach ($configs as $key => $value) {
            \App\Models\Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
