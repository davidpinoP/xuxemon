<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Config;

class ConfigController extends Controller
{
    // obtener todas las configs
    public function index()
    {
        // Devuelve key => value para que el panel admin pueda cargar y editar
        // todos los ajustes globales en un solo formulario.
        return response()->json(Config::all()->pluck('value', 'key'));
    }

    // obtener configs de juego para usuarios autenticados
    public function publicIndex()
    {
        // Exponemos solo las claves que necesita el cliente para pintar reglas
        // visibles, sin abrir todo el catalogo interno de configuracion.
        return response()->json([
            'pct_bajon_azucar'      => Config::getFloat('pct_bajon_azucar', 0),
            'pct_sobredosis_sucre'  => Config::getFloat('pct_sobredosis_sucre', 0),
            'pct_atracon'           => Config::getFloat('pct_atracon', 0),
            'evolve_xuxes'          => Config::getInt('evolve_xuxes', 3),
            'reward_hour'           => Config::getInt('reward_hour', 8),
            'reward_xuxes_amount'   => Config::getInt('reward_xuxes_amount', 10),
        ]);
    }

    // guardar varias configs a la vez
    public function store(Request $request)
    {
        $data = $request->validate([
            'pct_bajon_azucar'      => 'sometimes|numeric|min:0|max:100',
            'pct_sobredosis_sucre'  => 'sometimes|numeric|min:0|max:100',
            'pct_atracon'           => 'sometimes|numeric|min:0|max:100',
            'evolve_xuxes'          => 'sometimes|integer|min:1|max:999',
            'reward_hour'           => 'sometimes|integer|min:0|max:23',
            'reward_xuxes_amount'   => 'sometimes|integer|min:1|max:999',
        ], [
            'pct_bajon_azucar.max' => 'El % de Bajón de azúcar no puede superar el 100%.',
            'pct_sobredosis_sucre.max' => 'El % de Sobredosis de sucre no puede superar el 100%.',
            'pct_atracon.max'      => 'El % de Atracón no puede superar el 100%.',
            'evolve_xuxes.min'     => 'Se requiere al menos 1 caramelo para evolucionar.',
            'reward_hour.between'  => 'La hora de recompensa debe estar entre 0 y 23.',
            'reward_xuxes_amount.min' => 'La cantidad diaria de xuxes debe ser al menos 1.',
        ]);

        // updateOrCreate permite guardar varias claves en bloque desde el panel
        // sin depender de que ya existan filas previas en la tabla configs.
        foreach ($data as $key => $value) {
            Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['ok' => true]);
    }
}
