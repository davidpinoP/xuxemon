<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Anas',   'surname' => 'A', 'player_id' => '#Anas0001',    'email' => 'anas@test.com'],
            ['name' => 'Kenneth', 'surname' => 'K', 'player_id' => '#Kenneth0001', 'email' => 'kenneth@test.com'],
            ['name' => 'David',   'surname' => 'D', 'player_id' => '#David0001',   'email' => 'david@test.com'],
            ['name' => 'Marta',   'surname' => 'M', 'player_id' => '#Marta0099',    'email' => 'marta@test.com'],
            ['name' => 'Joel',    'surname' => 'J', 'player_id' => '#Joel0001',    'email' => 'joel@test.com'],
        ];

        foreach ($users as $userData) {
            // updateOrCreate para asegurar que los IDs se corrijan si ya existen los correos
            User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password123'),
                    'is_active' => true,
                    'role' => 'user'
                ])
            );
        }
    }
}
