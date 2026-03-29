<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\DailyRewardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AutenticatorController extends Controller
{
    private DailyRewardService $dailyRewardService;

    public function __construct(DailyRewardService $dailyRewardService)
    {
        $this->dailyRewardService = $dailyRewardService;
    }


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
     * Comprueba si el usuario tiene derecho a la recompensa diaria (después de la hora configurada).
     */
    private function checkDailyRewards(User $user)
    {
        $this->dailyRewardService->grantIfEligible($user);
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
