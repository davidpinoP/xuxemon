<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Item;
use App\Models\UserItem;
use App\Models\Xuxemon;
use App\Models\UserXuxemon;

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

        // El Item 1 es la xuxe normal
        $idXuxe = 1;

        $inventario = UserItem::firstOrNew([
            'user_id' => $usuario->id,
            'item_id' => $idXuxe
        ]);

        $inventario->cantidad += $request->cantidad;
        $inventario->save();

        return response()->json([
            'mensaje' => 'Chuches añadidas al jugador',
            'inventario' => $inventario
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

        // Se lo guarda al usuario en tamaño pequeño
        $nuevoXuxemon = UserXuxemon::create([
            'user_id' => $usuario->id,
            'xuxemon_id' => $xuxemonAlea->id,
            'tamano' => 'Pequeño'
        ]);

        return response()->json([
            'mensaje' => 'Xuxemon asignado correctamente',
            'xuxemon' => $xuxemonAlea,
            'registro' => $nuevoXuxemon
        ], 201);
    }
}
