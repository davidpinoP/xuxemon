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
            'infection_pct' => Config::getFloat('infection_pct', 0),
            'evolve_xuxes' => Config::getInt('evolve_xuxes', 3),
            'reward_hour' => Config::getInt('reward_hour', 8),
        ]);
    }

    // guardar varias configs a la vez
    public function store(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['ok' => true]);
    }
}
