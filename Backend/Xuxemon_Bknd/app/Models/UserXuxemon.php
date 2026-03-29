<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserXuxemon extends Model
{
    protected $fillable = [
        'user_id',
        'xuxemon_id',
        'tamano',
    ];
}
