<?php

namespace App\Http\Controllers;

use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendRequestController extends Controller
{
    //  Enviar una solicitud de amistad
    public function send(Request $request)
    {
        // Validamos que nos manden el ID del usuario al que queremos agregar
        $request->validate([
            'receiver_id' => 'required|exists:users,id'
        ]);

        $senderId = $request->user()->id;
        $receiverId = $request->receiver_id;

        //  No puedes agregarte a ti mismo
        if ($senderId == $receiverId) {
            return response()->json(['message' => 'No puedes enviarte una solicitud a ti mismo.'], 400);
        }

        //  Comprobar si ya hay una solicitud pendiente 
        $existingRequest = FriendRequest::where(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)->where('receiver_id', $senderId);
        })->first();

        if ($existingRequest) {
            return response()->json(['message' => 'Ya existe una solicitud entre estos usuarios.'], 400);
        }

        // Creamos la solicitud
        $friendRequest = FriendRequest::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Solicitud enviada con éxito.', 'data' => $friendRequest], 201);
    }

    //  Listar mis solicitudes pendientes 
    public function pending(Request $request)
    {
        $userId = $request->user()->id;

        // Buscamos las que nos tienen como receptor, y traemos los datos del "sender"
        $requests = FriendRequest::with('sender:id,name,email') 
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->get();

        return response()->json($requests, 200);
    }

    // Listar mis amigos
    public function listarAmigos(Request $request)
    {
        $user = $request->user();
        $amigos = $user->amigos()->select('users.id', 'users.name', 'users.surname', 'users.email')->get();
        return response()->json($amigos, 200);
    }

    //  Aceptar solicitud y crear amistad bidireccional
    public function accept(Request $request, $id)
    {
        $userId = $request->user()->id;
        
        $friendRequest = FriendRequest::where('id', $id)
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json(['message' => 'Solicitud no encontrada o ya procesada.'], 404);
        }

        // Cambiamos el estado a aceptado
        $friendRequest->status = 'accepted';
        $friendRequest->save();

       
        
        DB::table('amigos')->insertOrIgnore([
            [
                'user_id' => $friendRequest->sender_id, 
                'amigo_id' => $friendRequest->receiver_id, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
            [
                'user_id' => $friendRequest->receiver_id, 
                'amigo_id' => $friendRequest->sender_id, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
        ]);

        return response()->json(['message' => 'Solicitud aceptada. ¡Ahora sois amigos!'], 200);
    }

    //  Rechazar solicitud
    public function reject(Request $request, $id)
    {
        $userId = $request->user()->id;
        
        $friendRequest = FriendRequest::where('id', $id)
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json(['message' => 'Solicitud no encontrada o ya procesada.'], 404);
        }

        // Cambiamos el estado a rechazado
        $friendRequest->status = 'rejected';
        $friendRequest->save();

        return response()->json(['message' => 'Solicitud rechazada.'], 200);
    }
}