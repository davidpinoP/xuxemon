<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AutenticatorController extends Controller
{
     public function showRegister()
    {
        return view('regist.Registre');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'surname' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'repetir_password' => 'required|in:password',
        ]);

        User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'repetir_password' => $request->repetir_password,
        ]);

        return redirect()->route('regist.Login')->with('success', 'Registro completado. Por favor inicia sesión.');
    }

    public function showLogin()
    {
        return view('regist.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $request->session()->regenerate();
            return redirect()->route('dashboard');
        }

        return back()->withErrors([
            'email' => 'Las credenciales no son correctas.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('regist.Login');
    }
}
