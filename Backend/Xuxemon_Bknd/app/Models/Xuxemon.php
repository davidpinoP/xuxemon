<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Xuxemon extends Model
{
    protected $fillable = [
        'nombre',
        'tipo',
        'descripcion',
        'vida',
        'ataque',
        'defensa',
        'imagen',
        'tamano',
    ];
}
