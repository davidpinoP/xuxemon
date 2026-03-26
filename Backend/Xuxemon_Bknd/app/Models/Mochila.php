<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mochila extends Model
{
    protected $table = 'mochilas';

    protected $fillable = [
        'user_id',
        'nombre',
        'cantidad',
        'tipo',
        'tamano',
    ];

    /**
     * Get the user that owns the mochila entry.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
