<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserXuxemon extends Model
{
    protected $fillable = [
        'user_id',
        'xuxemon_id',
        'tamano',
        'comidas',
        'imagen',
        'enfermedad',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function xuxemon()
    {
        return $this->belongsTo(Xuxemon::class);
    }
}
