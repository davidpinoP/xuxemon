<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AutenticatorController extends Controller
{


    // ---- Rutas API (JWT) ----

    public function login(Request $request)
    {
        $request->validate([
            'player_id' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = [
            'player_id' => $request->player_id,
            'password' => $request->password,
        ];

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $user = auth('api')->user();
        $this->checkDailyRewards($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => $user
        ]);
    }

    public function apiRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'sometimes|in:admin,user', // Optional role parameter
        ]);

        $isFirstUser = User::count() === 0;

        $user = User::create([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'player_id' => $this->generatePlayerId($validated['name']),
            'role' => $request->has('role') ? $validated['role'] : ($isFirstUser ? 'admin' : 'user'),
            'is_active' => true,
        ]);

        $this->checkDailyRewards($user);

        $token = auth('api')->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'player_id' => $user->player_id
        ]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    // ---- Helpers ----

    /**
     * Comprueba si el usuario tiene derecho a la recompensa diaria (después de las 08:00 AM)
     */
    private function checkDailyRewards(User $user)
    {
        $now = now();

        // Solo si son más de las 08:00 AM
        if ($now->hour < 8) {
            return;
        }

        // Si ya ha recibido el premio hoy, no hacer nada
        if ($user->last_reward_at && $user->last_reward_at->isToday()) {
            return;
        }

        // 1. Dar 10 Xuxes
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

        // 3. Actualizar la fecha de la última recompensa
        $user->last_reward_at = $now;
        $user->save();
    }

    private function generatePlayerId(string $name): string
    {
        $baseName = preg_replace('/\s+/', '', trim($name));
        $baseName = $baseName !== '' ? $baseName : 'Jugador';

        do {
            $randomSuffix = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $playerId = '#' . $baseName . $randomSuffix;
        } while (User::where('player_id', $playerId)->exists());

        return $playerId;
    }
}

