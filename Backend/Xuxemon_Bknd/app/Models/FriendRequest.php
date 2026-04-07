<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'status',
    ];

    // Relación: El usuario que envía la solicitud
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Relación: El usuario que recibe la solicitud
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}