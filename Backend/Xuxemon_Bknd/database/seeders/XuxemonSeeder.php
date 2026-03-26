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
        $xuxemons = [
            ['nombre' => 'Aqualix', 'tipo' => 'Agua', 'descripcion' => 'Xuxemon acuático.', 'imagen' => '/imagenes/assets/1.png', 'vida' => 100, 'ataque' => 10, 'defensa' => 10],
            ['nombre' => 'Terron', 'tipo' => 'Tierra', 'descripcion' => 'Xuxemon terrestre.', 'imagen' => '/imagenes/assets/2.png', 'vida' => 120, 'ataque' => 12, 'defensa' => 15],
            ['nombre' => 'Ventisc', 'tipo' => 'Aire', 'descripcion' => 'Xuxemon volador.', 'imagen' => '/imagenes/assets/3.png', 'vida' => 80, 'ataque' => 15, 'defensa' => 8],
        ];

        foreach ($xuxemons as $data) {
            Xuxemon::create($data);
        }
    }
}
