<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserXuxemon;
use App\Models\User;
use App\Models\Xuxemon;
use App\Models\Mochila;

class AdminController extends Controller
{
    private function calcularSlotsUsados(User $usuario): int
    {
        $slots = 0;
        foreach ($usuario->mochila as $item) {
            if ($item->tipo === 'xuxemon') continue;
            
            if ($item->tipo === 'vacuna') {
                $slots += $item->cantidad;
            } else {
                $slots += (int) ceil($item->cantidad / 5);
            }
        }
        return $slots;
    }

    // Dar xuxes a un usuario
    public function darChuches(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombre' => 'required|string|in:Xuxe Caramelo,Xuxe CHOCO,Xuxe Menta',
            'cantidad' => 'required|integer|min:1|max:999'
        ]);

        $usuario = User::findOrFail($request->user_id);

        $slotsUsados = $this->calcularSlotsUsados($usuario);
        $nombreXuxe = $request->nombre;

        $mochilaEntry = $usuario->mochila()->firstOrNew([
            'nombre' => $nombreXuxe,
            'tipo' => 'item',
        ]);

        $cantidadAnterior = $mochilaEntry->cantidad ?? 0;
        $slotsItemAnterior = (int) ceil($cantidadAnterior / 5);
        $slotsItemNuevos = (int) ceil(($cantidadAnterior + $request->cantidad) / 5);
        
        if (($slotsUsados - $slotsItemAnterior + $slotsItemNuevos) > 20) {
            return response()->json([
                'error' => 'La mochila del jugador está llena (límite de 20 casillas).'
            ], 400);
        }

        $mochilaEntry->cantidad += $request->cantidad;
        $mochilaEntry->save();

        return response()->json([
            'mensaje' => 'Chuches añadidas al jugador',
            'xuxe' => $nombreXuxe,
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

        $xuxemonAlea = $this->obtenerXuxemonAleatorioParaUsuario($usuario);

        if (!$xuxemonAlea) {
            return response()->json(['error' => 'No hay xuxemons creados aun'], 404);
        }

        $yaLoTenia = UserXuxemon::where('user_id', $usuario->id)
            ->where('xuxemon_id', $xuxemonAlea->id)
            ->exists();

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
                'enfermedad' => null,
                'enfermedades' => [],
            ]
        );

        return response()->json([
            'mensaje' => 'Xuxemon aleatorio regalado',
            'xuxemon' => $xuxemonAlea->nombre,
            'xuxemon_id' => $xuxemonAlea->id,
            'nuevo_desbloqueo' => !$yaLoTenia
        ], 201);
    }

    // dar una vacuna a un jugador
    public function darVacuna(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombre'  => 'required|string|in:Xocolatina,Xal de fruites,Inxulina',
        ], [
            'nombre.in' => 'La vacuna debe ser: Xocolatina, Xal de fruites o Inxulina.'
        ]);

        $u = User::findOrFail($request->user_id);
        
        if ($this->calcularSlotsUsados($u) >= 20) {
            return response()->json([
                'ok'      => false,
                'message' => 'La mochila del jugador está llena (límite de 20 casillas).'
            ], 400);
        }

        $entrada = $u->mochila()->firstOrNew([
            'nombre' => $request->nombre,
            'tipo'   => 'vacuna'
        ]);

        $entrada->cantidad = ($entrada->cantidad ?? 0) + 1;
        $entrada->save();

        return response()->json([
            'ok'      => true,
            'mensaje' => $request->nombre . ' entregada al jugador'
        ]);
    }

    private function obtenerXuxemonAleatorioParaUsuario(User $usuario): ?Xuxemon
    {
        $desbloqueados = UserXuxemon::where('user_id', $usuario->id)
            ->pluck('xuxemon_id');

        $pendiente = Xuxemon::query()
            ->when($desbloqueados->isNotEmpty(), function ($query) use ($desbloqueados) {
                $query->whereNotIn('id', $desbloqueados);
            })
            ->inRandomOrder()
            ->first();

        return $pendiente ?: Xuxemon::inRandomOrder()->first();
    }
}
