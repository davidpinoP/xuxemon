<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    /**
     * Lista los amigos reales del usuario autenticado.
     * Se apoya en la relacion friends() del modelo User.
     */
    public function index(Request $request)
    {
        $friends = auth('api')->user()
            ->friends()
            ->select('users.id', 'users.name', 'users.surname', 'users.email', 'users.player_id')
            ->get();

        return response()->json($friends, 200);
    }

    /**
     * Elimina la amistad en ambos sentidos porque el proyecto la guarda como
     * dos filas simetricas: A->B y B->A.
     */
    public function destroy(Request $request, $id)
    {
        $userId = auth('api')->id();
        $friendId = $id;

        DB::table('friends')->where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)->where('friend_id', $userId);
        })->delete();

        return response()->json(['message' => 'Amistad eliminada con éxito.'], 200);
    }
}
