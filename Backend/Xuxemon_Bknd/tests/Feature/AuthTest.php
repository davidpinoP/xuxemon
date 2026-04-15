<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_login(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'player_id' => $user->player_id,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'token_type', 'user']);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'password' => 'password123',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'player_id' => $user->player_id,
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson(['error' => 'Tu cuenta está desactivada. Por favor, contacta con soporte.']);
    }

    public function test_user_can_deactivate_their_own_account(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $token = auth('api')->login($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/user/deactivate');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Cuenta desactivada correctamente']);

        $user->refresh();
        $this->assertFalse($user->is_active);
    }

    public function test_deactivated_user_is_blocked_by_middleware(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $token = auth('api')->login($user);

        // Desactivamos al usuario directamente en DB (simulando acción admin o previa)
        $user->is_active = false;
        $user->save();

        // Intentamos acceder a una ruta protegida (ej: me)
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Acceso denegado: Tu cuenta está desactivada']);
    }
}
