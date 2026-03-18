<?php

namespace Database\Factories;

use App\Models\Xuxemon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Xuxemon>
 */
class XuxemonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipos = ['agua', 'tierra', 'aire', 'fuego', 'electrico', 'planta'];
        
        return [
            'nombre' => $this->faker->unique()->firstName() . 'mon',
            'tipo' => $this->faker->randomElement($tipos),
            'descripcion' => $this->faker->sentence(),
            'vida' => $this->faker->numberBetween(50, 200),
            'ataque' => $this->faker->numberBetween(10, 100),
            'defensa' => $this->faker->numberBetween(10, 100),
            'imagen' => '/imagenes/assets/' . $this->faker->numberBetween(1, 46) . '.png',
        ];
    }
}
