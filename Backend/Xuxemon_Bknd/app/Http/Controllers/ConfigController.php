<?php

namespace App\Http\Controllers;

use App\Models\Config;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    public function index()
    {
        return response()->json(Config::all()->pluck('value', 'key'));
    }

    public function publicIndex()
    {
        return response()->json([
            'infection_pct' => Config::getFloat('infection_pct', 0),
            'evolve_xuxes' => Config::getInt('evolve_xuxes', 3),
            'reward_hour' => Config::getInt('reward_hour', 8),
            'reward_xuxes_amount' => Config::getInt('reward_xuxes_amount', 10),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'infection_pct' => 'sometimes|numeric|min:0|max:100',
            'evolve_xuxes' => 'sometimes|integer|min:1|max:999',
            'reward_hour' => 'sometimes|integer|min:0|max:23',
            'reward_xuxes_amount' => 'sometimes|integer|min:1|max:999',
        ], [
            'infection_pct.max' => 'La probabilidad de infeccion no puede superar el 100%.',
            'evolve_xuxes.min' => 'Se requiere al menos 1 caramelo para evolucionar.',
            'reward_hour.between' => 'La hora de recompensa debe estar entre 0 y 23.',
            'reward_xuxes_amount.min' => 'La recompensa diaria debe entregar al menos 1 xuxe.',
        ]);

        foreach ($data as $key => $value) {
            Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json([
            'ok' => true,
            'message' => 'Configuracion guardada correctamente.'
        ]);
    }
}
