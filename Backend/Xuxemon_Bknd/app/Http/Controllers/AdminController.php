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
        $nuevoXuxemon = $usuario->mochila()->create([
            'nombre' => $xuxemonAlea->nombre,
            'cantidad' => 1,
            'tipo' => 'xuxemon',
            'tamano' => 'Pequeño'
        ]);

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
        $u = User::findOrFail($id);
        $u->mochila()->create([
            'nombre' => $request->nombre,
            'cantidad' => 1,
            'tipo' => 'item'
        ]);
        return response()->json(['ok' => true]);
    }
}
