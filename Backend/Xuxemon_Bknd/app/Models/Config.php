<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Exception; 

class Config extends Model
{
    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, $default = null)
    {
        try {
            $value = self::where('key', $key)->value('value');
            return $value !== null ? $value : $default;
        } catch (Exception $e) {
            return $default;
        }
    }

    public static function getInt(string $key, int $default): int
    {
        $value = self::getValue($key, null);
        return is_numeric($value) ? (int) $value : $default;
    }

    public static function getFloat(string $key, float $default): float
    {
        $value = self::getValue($key, null);
        return is_numeric($value) ? (float) $value : $default;
    }
}