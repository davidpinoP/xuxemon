<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Config;

class ConfigController extends Controller
{
    // obtener todas las configs
    public function index()
    {
        return response()->json(Config::all()->pluck('value', 'key'));
    }

    // obtener configs de juego para usuarios autenticados
    public function publicIndex()
    {
        return response()->json([
            'pct_bajon_azucar' => Config::getFloat('pct_bajon_azucar', 0),
            'pct_atracon'      => Config::getFloat('pct_atracon', 0),
            'evolve_xuxes'     => Config::getInt('evolve_xuxes', 3),
            'reward_hour'      => Config::getInt('reward_hour', 8),
        ]);
    }

    // guardar varias configs a la vez
    public function store(Request $request)
    {
        $data = $request->validate([
            'pct_bajon_azucar' => 'sometimes|numeric|min:0|max:100',
            'pct_atracon'      => 'sometimes|numeric|min:0|max:100',
            'evolve_xuxes'     => 'sometimes|integer|min:1|max:999',
            'reward_hour'      => 'sometimes|integer|min:0|max:23',
        ], [
            'pct_bajon_azucar.max' => 'El % de Bajón de azúcar no puede superar el 100%.',
            'pct_atracon.max'      => 'El % de Atracón no puede superar el 100%.',
            'evolve_xuxes.min'     => 'Se requiere al menos 1 caramelo para evolucionar.',
            'reward_hour.between'  => 'La hora de recompensa debe estar entre 0 y 23.',
        ]);

        foreach ($data as $key => $value) {
            Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['ok' => true]);
    }
}
