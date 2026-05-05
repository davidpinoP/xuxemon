<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\FriendRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendRequestController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        $senderId = (int) $request->user()->id;
        $receiverId = (int) $request->receiver_id;

        // Regla basica: nadie puede mandarse una solicitud a si mismo.
        if ($senderId === $receiverId) {
            return response()->json([
                'message' => 'No puedes enviarte una solicitud a ti mismo.',
            ], 422);
        }

        $alreadyFriends = Friend::query()
            ->where(function ($query) use ($senderId, $receiverId) {
                $query->where('user_id', $senderId)
                    ->where('friend_id', $receiverId);
            })
            ->orWhere(function ($query) use ($senderId, $receiverId) {
                $query->where('user_id', $receiverId)
                    ->where('friend_id', $senderId);
            })
            ->exists();

        // Si ya existe amistad en cualquiera de los dos sentidos, no tiene
        // sentido crear una solicitud nueva.
        if ($alreadyFriends) {
            return response()->json([
                'message' => 'Ya sois amigos.',
            ], 409);
        }

        $pendingRequestExists = FriendRequest::query()
            ->where('status', 'pending')
            ->where(function ($query) use ($senderId, $receiverId) {
                $query->where(function ($subQuery) use ($senderId, $receiverId) {
                    $subQuery->where('sender_id', $senderId)
                        ->where('receiver_id', $receiverId);
                })->orWhere(function ($subQuery) use ($senderId, $receiverId) {
                    $subQuery->where('sender_id', $receiverId)
                        ->where('receiver_id', $senderId);
                });
            })
            ->exists();

        // Tambien bloqueamos duplicados cuando la solicitud pendiente existe
        // en el sentido inverso, para evitar cruces o spam.
        if ($pendingRequestExists) {
            return response()->json([
                'message' => 'Ya existe una solicitud pendiente entre estos usuarios.',
            ], 409);
        }

        $friendRequest = FriendRequest::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Solicitud enviada con exito.',
            'data' => $friendRequest,
        ], 201);
    }

    public function pending(Request $request)
    {
        $userId = (int) $request->user()->id;

        // Cargamos tambien datos basicos del emisor para que el frontend pueda
        // pintar la tarjeta sin hacer peticiones extra por cada solicitud.
        $requests = FriendRequest::query()
            ->with('sender:id,name,surname,player_id,email')
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json($requests, 200);
    }

    public function accept(Request $request, $id)
    {
        $userId = (int) $request->user()->id;

        $friendRequest = FriendRequest::query()
            ->where('id', $id)
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'Solicitud no encontrada o ya procesada.',
            ], 404);
        }

        // La transaccion evita estados a medias: o se acepta y se crean las dos
        // amistades, o no se guarda nada.
        DB::transaction(function () use ($friendRequest) {
            $friendRequest->update(['status' => 'accepted']);

            Friend::firstOrCreate([
                'user_id' => $friendRequest->sender_id,
                'friend_id' => $friendRequest->receiver_id,
            ]);

            Friend::firstOrCreate([
                'user_id' => $friendRequest->receiver_id,
                'friend_id' => $friendRequest->sender_id,
            ]);
        });

        return response()->json([
            'message' => 'Solicitud aceptada. Ahora sois amigos.',
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $userId = (int) $request->user()->id;

        $friendRequest = FriendRequest::query()
            ->where('id', $id)
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendRequest) {
            return response()->json([
                'message' => 'Solicitud no encontrada o ya procesada.',
            ], 404);
        }

        // Rechazar no borra historico: simplemente marca la solicitud como rechazada.
        $friendRequest->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Solicitud rechazada.',
        ], 200);
    }

    public function reject(Request $request, $id)
    {
        return $this->destroy($request, $id);
    }
}
