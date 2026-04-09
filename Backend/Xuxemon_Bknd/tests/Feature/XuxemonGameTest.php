<?php

namespace Tests\Feature;

use App\Models\Mochila;
use App\Models\User;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class XuxemonGameTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_feed_their_xuxemon_and_progress_size(): void
    {
        $user = User::factory()->create();
        $xuxemon = Xuxemon::factory()->create([
            'nombre' => 'Xuxechu',
        ]);

        Mochila::create([
            'user_id' => $user->id,
            'nombre' => 'Xuxechu',
            'cantidad' => 1,
            'tipo' => 'xuxemon',
            'tamano' => 'Pequeño',
        ]);

        Mochila::create([
            'user_id' => $user->id,
            'nombre' => 'Xuxe',
            'cantidad' => 3,
            'tipo' => 'item',
        ]);

        UserXuxemon::create([
            'user_id' => $user->id,
            'xuxemon_id' => $xuxemon->id,
            'tamano' => 'Pequeño',
            'comidas' => 0,
            'imagen' => $xuxemon->imagen,
            'enfermedad' => null,
        ]);

        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/xuxemons/'.$xuxemon->id.'/alimentar', [
                'xuxe' => 'Xuxe',
                'cantidad' => 3,
            ]);

        $response->assertOk()
            ->assertJsonPath('xuxemon.tamano', 'Mediano')
            ->assertJsonPath('xuxemon.comidas', 3);

        $this->assertDatabaseHas('user_xuxemons', [
            'user_id' => $user->id,
            'xuxemon_id' => $xuxemon->id,
            'tamano' => 'Mediano',
            'comidas' => 3,
        ]);
    }
}
