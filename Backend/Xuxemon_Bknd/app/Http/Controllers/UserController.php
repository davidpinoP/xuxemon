<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    // 1. Ver perfil del usuario autenticado
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    // 2. Actualizar datos del perfil
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user->name = $data['name'];
        $user->surname = $data['surname'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado con éxito',
            'user' => $user
        ]);
    }

    // 3. Dar de baja (is_active = false)
    public function deactivate(Request $request)
    {
        $user = $request->user();
        $user->is_active = false;
        $user->save();

        // Si usas tokens (Sanctum), los borramos para cerrar sesión
        $user->tokens()->delete();

        return response()->json(['message' => 'Cuenta desactivada correctamente']);
    }
}