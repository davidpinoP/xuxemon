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

    // guardar varias configs a la vez
    public function store(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            Config::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['ok' => true]);
    }
}
