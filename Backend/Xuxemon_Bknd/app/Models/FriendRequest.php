<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    use HasFactory;

    // Permitir rellenar estas columnas
    protected $fillable = ['sender_id', 'receiver_id', 'status'];

    // Relación: Una solicitud pertenece a un usuario que la envía (sender)
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Relación: Una solicitud pertenece a un usuario que la recibe (receiver)
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}