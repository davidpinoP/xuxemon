<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AutenticatorController extends Controller
{
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

        // Creamos el usuario asegurando que esté activo (true)
        $user = User::create([
            'name' => $validated['name'],
            'surname' => $validated['surname'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // Encriptamos la clave
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

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Intentamos la autenticación
        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            
            $user = Auth::user();

            // BLOQUEO DE BAJA: Si el usuario no está activo, cerramos sesión y avisamos
            if (!$user->is_active) {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Esta cuenta ha sido dada de baja y no puede acceder.',
                ])->onlyInput('email');
            }

            // Si está activo, regeneramos la sesión y entra
            $request->session()->regenerate();
            return redirect()->route('dashboard');
        }

        // Si fallan las credenciales
        return back()->withErrors([
            'email' => 'Las credenciales no son correctas.',
        ])->onlyInput('email');
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