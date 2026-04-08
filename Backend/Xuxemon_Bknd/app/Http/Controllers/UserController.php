<?php

namespace App\Http\Controllers;

use App\Models\FriendRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    // 1. Ver perfil del usuario autenticado
    public function show(Request $request)
    {
        $user = $request->user();
        $user->mochila = $user->mochila; // Cargar mochila
        return response()->json($user);
    }

    // Buscar usuarios por player_id para futuras amistades
    public function searchUsers(Request $request)
    {
        $query = trim((string) $request->query('q', ''));

        if (strlen($query) < 3) {
            return response()->json([]);
        }

        $users = \App\Models\User::query()
            ->where('id', '!=', $request->user()->id)
            ->where('is_active', true)
            ->where('player_id', 'like', '%' . $query . '%')
            ->orderBy('player_id')
            ->limit(10)
            ->get(['id', 'name', 'surname', 'player_id']);

        return response()->json($users);
    }

    public function sendFriendRequest(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'receiver_id' => 'required|integer|exists:users,id',
        ]);

        if ((int) $data['receiver_id'] === (int) $user->id) {
            return response()->json([
                'message' => 'No puedes enviarte una solicitud a ti mismo.'
            ], 422);
        }

        $existingRequest = FriendRequest::query()
            ->where('status', 'pending')
            ->where(function ($query) use ($user, $data) {
                $query->where(function ($subQuery) use ($user, $data) {
                    $subQuery->where('sender_id', $user->id)
                        ->where('receiver_id', $data['receiver_id']);
                })->orWhere(function ($subQuery) use ($user, $data) {
                    $subQuery->where('sender_id', $data['receiver_id'])
                        ->where('receiver_id', $user->id);
                });
            })
            ->first();

        if ($existingRequest) {
            return response()->json([
                'message' => 'Ya existe una solicitud pendiente entre estos usuarios.'
            ], 422);
        }

        FriendRequest::create([
            'sender_id' => $user->id,
            'receiver_id' => $data['receiver_id'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Solicitud enviada correctamente.'
        ], 201);
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

        // Borrar el inventario actual en la tabla
        $user->mochila()->delete();

        foreach ($data['inventory'] as $item) {
            $user->mochila()->create([
                'nombre' => $item['nombre'],
                'cantidad' => $item['cantidad'] ?? 1,
                'tipo' => $item['tipo'] ?? null,
                'tamano' => $item['tamano'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Inventario actualizado con éxito',
            'inventory' => $user->mochila
        ]);
    }

    // 6. Modificar un ítem específico del inventario (Solo Admin)
    public function modifyItemInInventory(Request $request, $id, $itemName)
    {
        $user = \App\Models\User::findOrFail($id);
        $itemName = urldecode($itemName);

        $data = $request->validate([
            'cantidad' => 'required|integer|min:1',
        ]);

        $mochilaEntry = $user->mochila()->where('nombre', $itemName)->first();

        if (!$mochilaEntry) {
            return response()->json(['message' => 'Ítem no encontrado en el inventario'], 404);
        }

        $mochilaEntry->update(['cantidad' => $data['cantidad']]);

        return response()->json([
            'message' => 'Cantidad del ítem actualizada con éxito',
            'inventory' => $user->mochila
        ]);
    }

    // 7. Eliminar un ítem específico del inventario (Solo Admin)
    public function deleteItemFromInventory($id, $itemName)
    {
        $user = \App\Models\User::findOrFail($id);
        $itemName = urldecode($itemName);

        $mochilaEntry = $user->mochila()->where('nombre', $itemName)->first();

        if (!$mochilaEntry) {
            return response()->json(['message' => 'Ítem no encontrado en el inventario'], 404);
        }

        $mochilaEntry->delete();

        return response()->json([
            'message' => 'Ítem eliminado con éxito',
            'inventory' => $user->mochila
        ]);
    }

    // comprobar si hay recompensas (minimo)
    public function checkRewards(Request $request)
    {
        $u = $request->user();
        $h = \App\Models\Config::where('key', 'reward_hour')->first()->value ?? 0;
        
        $now = now();
        $canShow = ($now->hour >= $h) && (!$u->last_reward_at || !$u->last_reward_at->isToday());

        return response()->json(['can_claim' => $canShow]);
    }

    // reclamar recompensa (minimo)
    public function claimReward(Request $request)
    {
        $u = $request->user();
        $u->mochila()->create(['nombre' => 'Xuxe', 'cantidad' => 5, 'tipo' => 'item']);
        $u->update(['last_reward_at' => now()]);
        return response()->json(['ok' => true]);
    }
}
