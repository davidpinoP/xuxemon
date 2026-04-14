<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserXuxemon;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\Mochila;

class AdminController extends Controller
{
    // Dar xuxes a un usuario
    public function darChuches(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'cantidad' => 'required|integer|min:1'
        ]);

        $usuario = User::findOrFail($request->user_id);

        // Buscamos el item 1 para saber su nombre
        $itemXuxe = \App\Models\Item::find(1);
        $nombreXuxe = $itemXuxe ? $itemXuxe->nombre : 'Xuxe';

        $mochilaEntry = $usuario->mochila()->firstOrNew([
            'nombre' => $nombreXuxe,
            'tipo' => 'item',
        ]);

        $mochilaEntry->cantidad += $request->cantidad;
        $mochilaEntry->save();

        return response()->json([
            'mensaje' => 'Chuches añadidas al jugador',
            'inventario' => $usuario->mochila
        ], 200);
    }

    // Regalar un xuxemon al azar al jugador
    public function darXuxemonAleatorio(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $usuario = User::findOrFail($request->user_id);

        // Pilla uno aleatorio de la bd
        $xuxemonAlea = Xuxemon::inRandomOrder()->first();

        if (!$xuxemonAlea) {
            return response()->json(['error' => 'No hay xuxemons creados aun'], 404);
        }

        // Se lo guarda al usuario en tamaño pequeño en la mochila
        $entradaMochila = $usuario->mochila()->firstOrNew([
            'nombre' => $xuxemonAlea->nombre,
            'tipo' => 'xuxemon',
        ]);

        $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
        $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeño';
        $entradaMochila->save();

        UserXuxemon::firstOrCreate(
            [
                'user_id' => $usuario->id,
                'xuxemon_id' => $xuxemonAlea->id,
            ],
            [
                'tamano' => 'Pequeño',
                'comidas' => 0,
                'imagen' => $xuxemonAlea->imagen,
            ]
        );

        return response()->json(['ok' => true], 201);
    }

    // dar una vacuna a un jugador
    public function darVacuna(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $u = User::findOrFail($id);
        $entrada = $u->mochila()->firstOrNew([
            'nombre' => $request->nombre,
            'tipo' => 'item'
        ]);

        $entrada->cantidad = ($entrada->cantidad ?? 0) + 1;
        $entrada->save();

        return response()->json(['ok' => true]);
    }
}
