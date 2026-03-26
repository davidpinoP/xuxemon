<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Xuxemon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'player_id' => 'Admin001',
            'password' => Hash::make('Admin001'),
            'role' => 'admin',
            'is_active' => true,
            'surname' => 'System'
        ]);

        // Regular user
        User::create([
            'name' => 'User',
            'email' => 'user@user.com',
            'player_id' => 'User001',
            'password' => Hash::make('password'),
            'role' => 'user',
            'is_active' => true,
            'surname' => 'Player',
            'inventory' => [
                ['nombre' => 'Caramelo Raro', 'cantidad' => 10],
                ['nombre' => 'Poción', 'cantidad' => 5],
            ]
        ]);

        $this->call(XuxemonSeeder::class);
    }
}
