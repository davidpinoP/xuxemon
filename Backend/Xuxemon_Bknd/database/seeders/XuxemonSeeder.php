<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Xuxemon;

class XuxemonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Xuxemon::factory()->count(10)->create();
    }
}
