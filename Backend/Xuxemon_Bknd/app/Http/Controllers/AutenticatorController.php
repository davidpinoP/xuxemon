<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AutenticatorController extends Controller
{
    public function login(Request $request)
    {
        // El login del juego se hace con player_id, no con email.
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

        // Si la cuenta fue dada de baja, no permitimos volver a entrar.
        if (!$user->is_active) {
            auth('api')->logout();

            return response()->json([
                'error' => 'Tu cuenta está desactivada. Por favor, contacta con soporte.'
            ], 403);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
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
            'role' => 'sometimes|in:admin,user',
        ]);

        // El primer usuario del sistema se convierte automaticamente en admin.
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

        $token = auth('api')->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'player_id' => $user->player_id,
            'user' => $user,
        ]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function logout()
    {
        $token = JWTAuth::getToken();

        if ($token) {
            JWTAuth::invalidate($token);
        }

        auth('api')->logout();

        return response()->json([
            'message' => 'Sesion cerrada correctamente.'
        ]);
    }

    private function generatePlayerId(string $name): string
    {
        // El ID final sigue la forma #NombreXXXX y se comprueba que sea unico.
        $baseName = preg_replace('/\s+/', '', trim($name));
        $baseName = $baseName !== '' ? $baseName : 'Jugador';

        do {
            $randomSuffix = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $playerId = '#' . $baseName . $randomSuffix;
        } while (User::where('player_id', $playerId)->exists());

        return $playerId;
    }
}
