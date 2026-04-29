<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private const VACCINE_NAMES = [
        'xocolatina' => 'Vacuna Xocolatina',
        'xal de fruites' => 'Vacuna Xal de fruites',
        'inxulina' => 'Vacuna Inxulina',
    ];

    public function darChuches(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'cantidad' => 'required|integer|min:1|max:999'
        ]);

        $usuario = User::findOrFail($request->user_id);
        $itemXuxe = \App\Models\Item::find(1);
        $nombreXuxe = $itemXuxe ? $itemXuxe->nombre : 'Xuxe';

        $mochilaEntry = $usuario->mochila()->firstOrNew([
            'nombre' => $nombreXuxe,
            'tipo' => 'item',
        ]);

        $mochilaEntry->cantidad += $request->cantidad;
        $mochilaEntry->save();

        return response()->json([
            'mensaje' => 'Chuches anadidas al jugador',
            'inventario' => $usuario->mochila
        ], 200);
    }

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

        $entradaMochila = $usuario->mochila()->firstOrNew([
            'nombre' => $xuxemonAlea->nombre,
            'tipo' => 'xuxemon',
        ]);

        $entradaMochila->cantidad = ($entradaMochila->cantidad ?? 0) + 1;
        $entradaMochila->tamano = $entradaMochila->tamano ?: 'Pequeno';
        $entradaMochila->save();

        UserXuxemon::firstOrCreate(
            [
                'user_id' => $usuario->id,
                'xuxemon_id' => $xuxemonAlea->id,
            ],
            [
                'tamano' => 'Pequeno',
                'comidas' => 0,
                'imagen' => $xuxemonAlea->imagen,
                'enfermedad' => null,
            ]
        );

        return response()->json([
            'mensaje' => 'Xuxemon aleatorio regalado',
            'xuxemon' => $xuxemonAlea->nombre,
            'xuxemon_id' => $xuxemonAlea->id,
            'nuevo_desbloqueo' => !$yaLoTenia
        ], 201);
    }

    public function darVacuna(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'nombre' => 'required|string|max:50',
        ]);

        $usuario = User::findOrFail($request->user_id);
        $nombreVacuna = $this->normalizarVacuna($request->nombre);

        if (!$nombreVacuna) {
            return response()->json([
                'message' => 'Vacuna no valida. Usa Xocolatina, Xal de fruites o Inxulina.',
            ], 422);
        }

        $entrada = $usuario->mochila()->firstOrNew([
            'nombre' => $nombreVacuna,
            'tipo' => 'item'
        ]);

        $entrada->cantidad = ($entrada->cantidad ?? 0) + 1;
        $entrada->save();

        return response()->json([
            'ok' => true,
            'mensaje' => 'Vacuna entregada al jugador'
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

    private function normalizarVacuna(string $nombre): ?string
    {
        $normalized = mb_strtolower(trim($nombre));
        $normalized = preg_replace('/^vacuna\s+/u', '', $normalized ?? '');

        return self::VACCINE_NAMES[$normalized] ?? null;
    }
}
