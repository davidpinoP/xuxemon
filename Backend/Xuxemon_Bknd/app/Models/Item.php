<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'es_apilable',
    ];

    /**
     * Get all of the item's mochila entries.
     */
    public function mochilas()
    {
        return $this->morphMany(Mochila::class, 'itemable');
    }
}
