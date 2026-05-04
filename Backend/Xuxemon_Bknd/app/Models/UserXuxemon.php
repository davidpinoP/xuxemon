<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class UserXuxemon extends Model
{
    protected $fillable = [
        'user_id',
        'xuxemon_id',
        'tamano',
        'comidas',
        'imagen',
        'enfermedad',
        'enfermedades',
    ];

    protected $casts = [
        'enfermedades' => 'array',
    ];

    public static function initialAttributesFor(Xuxemon $xuxemon, ?string $tamano = null): array
    {
        $attributes = [
            'tamano' => $tamano ?: 'Pequeño',
            'comidas' => 0,
            'imagen' => $xuxemon->imagen,
            'enfermedad' => null,
        ];

        if (self::hasEnfermedadesColumn()) {
            $attributes['enfermedades'] = [];
        }

        return $attributes;
    }

    public static function hasEnfermedadesColumn(): bool
    {
        static $hasColumn = null;

        if ($hasColumn === null) {
            $hasColumn = Schema::hasColumn((new self())->getTable(), 'enfermedades');
        }

        return $hasColumn;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function xuxemon()
    {
        return $this->belongsTo(Xuxemon::class);
    }
}
