<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Xuxemon extends Model
{
    use HasFactory;
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

    /**
     * Get all of the xuxemon's mochila entries.
     */
    public function mochilas()
    {
        return $this->morphMany(Mochila::class, 'itemable');
    }
}
