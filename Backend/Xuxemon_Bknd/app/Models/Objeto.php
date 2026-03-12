<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Objeto extends Model
{
    protected $fillable = [
        'nombre',
        'tipo',
        'descripcion',
        'imagen',
        'es_apilable',
        'cantidad',
    ];
}
