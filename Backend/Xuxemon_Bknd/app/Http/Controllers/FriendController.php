<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    /**
     * List all friends of the authenticated user.
     */
    public function index(Request $request)
    {
        $friends = auth('api')->user()
            ->friends()
            ->select('users.id', 'users.name', 'users.surname', 'users.email')
            ->get();

        return response()->json($friends, 200);
    }

    /**
     * Remove a friendship (bidirectional).
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
