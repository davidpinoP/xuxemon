<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AutenticatorController extends Controller
{
    // ---- Rutas WEB (sesión) ----

    public function showRegister()
    {
        return view('Registre');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $isFirstUser = User::count() === 0;

        $user = User::create([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'player_id' => $this->generatePlayerId($validated['name']),
            'role' => $isFirstUser ? 'admin' : 'user',
            'is_active' => true,
        ]);

        return redirect()->route('login')->with(
            'success',
            'Registro completado. Tu ID es ' . $user->player_id . '. Inicia sesión.'
        );
    }

    public function showLogin()
    {
        return view('Login');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function dashboard()
    {
        return view('dashboard');
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
            'password'  => $request->password,
        ];

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
        ]);
    }

    public function apiRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $isFirstUser = User::count() === 0;

        $user = User::create([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'player_id' => $this->generatePlayerId($validated['name']),
            'role' => $isFirstUser ? 'admin' : 'user',
            'is_active' => true,
        ]);

        $token = auth('api')->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'player_id'    => $user->player_id
        ]);
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    // ---- Helpers ----

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
 