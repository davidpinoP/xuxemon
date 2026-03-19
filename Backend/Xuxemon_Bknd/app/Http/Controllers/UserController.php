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

    // 4. Listar todos los usuarios (Solo Admin)
    public function index()
    {
        return response()->json(\App\Models\User::all());
    }

    // 5. Actualizar inventario de un usuario (Solo Admin)
    public function updateInventory(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);

        $data = $request->validate([
            'inventory' => 'required|array',
        ]);

        $user->inventory = $data['inventory'];
        $user->save();

        return response()->json([
            'message' => 'Inventario actualizado con éxito',
            'inventory' => $user->inventory
        ]);
    }

    // 6. Modificar un ítem específico del inventario (Solo Admin)
    public function modifyItemInInventory(Request $request, $id, $itemName)
    {
        $user = \App\Models\User::findOrFail($id);

        $data = $request->validate([
            'cantidad' => 'required|integer|min:1',
        ]);

        $inventory = $user->inventory ?? [];
        $itemFound = false;

        foreach ($inventory as &$item) {
            if (isset($item['nombre']) && urldecode($item['nombre']) === urldecode($itemName)) {
                $item['cantidad'] = $data['cantidad'];
                $itemFound = true;
                break;
            }
        }

        if (!$itemFound) {
            return response()->json(['message' => 'Ítem no encontrado en el inventario'], 404);
        }

        $user->inventory = $inventory;
        $user->save();

        return response()->json([
            'message' => 'Cantidad del ítem actualizada con éxito',
            'inventory' => $user->inventory
        ]);
    }

    // 7. Eliminar un ítem específico del inventario (Solo Admin)
    public function deleteItemFromInventory($id, $itemName)
    {
        $user = \App\Models\User::findOrFail($id);

        $inventory = $user->inventory ?? [];
        $itemFound = false;

        $filteredInventory = array_filter($inventory, function ($item) use ($itemName, &$itemFound) {
            if (isset($item['nombre']) && urldecode($item['nombre']) === urldecode($itemName)) {
                $itemFound = true;
                return false; // Remove this item
            }
            return true; // Keep others
        });

        if (!$itemFound) {
            return response()->json(['message' => 'Ítem no encontrado en el inventario'], 404);
        }

        // Reindex array so it stays as a JSON array instead of a JSON object
        $user->inventory = array_values($filteredInventory);
        $user->save();

        return response()->json([
            'message' => 'Ítem eliminado con éxito',
            'inventory' => $user->inventory
        ]);
    }
}