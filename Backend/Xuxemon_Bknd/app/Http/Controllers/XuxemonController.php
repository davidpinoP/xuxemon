<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    // Devuelve todos los xuxemons del catalogo
    public function index()
    {
        $xuxemons = Xuxemon::all();
        return response()->json($xuxemons);
    }

    public function feed(Request $request, $id)
    {
        $request->validate([
            'xuxe' => 'required|string',
            'cantidad' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        
        $userXuxemon = \App\Models\UserXuxemon::where('user_id', $user->id)
            ->where('xuxemon_id', $id)
            ->first();

        if (!$userXuxemon) {
            $userXuxemon = \App\Models\UserXuxemon::create([
                'user_id' => $user->id,
                'xuxemon_id' => $id,
                'tamano' => 'Pequeño',
                'comidas' => 0
            ]);
        }

        $inventory = $user->inventory ?? [];
        $hasItem = false;
        $xuxeName = $request->xuxe;
        $cantidad = $request->cantidad;

        foreach ($inventory as &$item) {
            if (isset($item['nombre']) && urldecode($item['nombre']) === urldecode($xuxeName)) {
                if ($item['cantidad'] >= $cantidad) {
                    $item['cantidad'] -= $cantidad;
                    $hasItem = true;
                }
                break;
            }
        }

        if (!$hasItem) {
            return response()->json(['message' => 'No tienes suficientes ' . $xuxeName], 400);
        }

        // Clean up empty items
        $inventory = array_values(array_filter($inventory, fn($item) => $item['cantidad'] > 0));
        
        $user->inventory = $inventory;
        $user->save();

        $userXuxemon->comidas += $cantidad;
        
        $catalogXuxemon = Xuxemon::find($id);
        $baseImage = $catalogXuxemon ? $catalogXuxemon->imagen : '';

        if ($userXuxemon->comidas >= 5) {
            $userXuxemon->tamano = 'Grande';
        } elseif ($userXuxemon->comidas >= 3) {
            $userXuxemon->tamano = 'Mediano';
        }

        $userXuxemon->save();

        return response()->json([
            'message' => 'Xuxemon alimentado correctamente',
            'userXuxemon' => $userXuxemon,
            'inventory' => $user->inventory
        ]);
    }
}
