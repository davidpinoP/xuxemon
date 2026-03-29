<?php

namespace App\Http\Controllers;

use App\Models\UserXuxemon;
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

    public function misXuxemons(Request $request)
    {
        $user = $request->user();

        $this->sincronizarXuxemonsUsuario($user);

        $misXuxemons = UserXuxemon::with('xuxemon')
            ->where('user_id', $user->id)
            ->get();

        $resultado = [];

        foreach ($misXuxemons as $registro) {
            if (!$registro->xuxemon) {
                continue;
            }

            $resultado[] = [
                'id' => $registro->xuxemon->id,
                'nombre' => $registro->xuxemon->nombre,
                'tipo' => $registro->xuxemon->tipo,
                'descripcion' => $registro->xuxemon->descripcion,
                'imagen' => $registro->imagen ?: $registro->xuxemon->imagen,
                'tamano' => $registro->tamano ?: 'Pequeño',
                'comidas' => $registro->comidas ?? 0,
                'created_at' => $registro->xuxemon->created_at,
                'updated_at' => $registro->xuxemon->updated_at,
            ];
        }

        return response()->json($resultado);
    }

    public function alimentar(Request $request, $id)
    {
        $datos = $request->validate([
            'xuxe' => 'required|string',
            'cantidad' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $this->sincronizarXuxemonsUsuario($user);

        $registro = UserXuxemon::with('xuxemon')
            ->where('user_id', $user->id)
            ->where('xuxemon_id', $id)
            ->first();

        if (!$registro || !$registro->xuxemon) {
            return response()->json([
                'message' => 'No tienes este Xuxemon.'
            ], 404);
        }

        $item = $user->mochila()
            ->where('nombre', $datos['xuxe'])
            ->where('tipo', '!=', 'xuxemon')
            ->first();

        if (!$item || $item->cantidad < $datos['cantidad']) {
            return response()->json([
                'message' => 'No tienes suficientes xuxes.'
            ], 400);
        }

        $item->cantidad -= $datos['cantidad'];

        if ($item->cantidad <= 0) {
            $item->delete();
        } else {
            $item->save();
        }

        $registro->comidas = ($registro->comidas ?? 0) + $datos['cantidad'];
        $tamanoAnterior = $registro->tamano ?: 'Pequeño';

        if ($registro->comidas >= 5) {
            $registro->tamano = 'Grande';
        } elseif ($registro->comidas >= 3) {
            $registro->tamano = 'Mediano';
        } else {
            $registro->tamano = 'Pequeño';
        }

        $registro->imagen = $registro->xuxemon->imagen;
        $registro->save();

        $entradaMochila = $user->mochila()
            ->where('tipo', 'xuxemon')
            ->where('nombre', $registro->xuxemon->nombre)
            ->first();

        if ($entradaMochila) {
            $entradaMochila->tamano = $registro->tamano;
            $entradaMochila->save();
        }

        return response()->json([
            'message' => 'Xuxemon alimentado correctamente.',
            'evoluciono' => $tamanoAnterior !== $registro->tamano,
            'xuxemon' => [
                'id' => $registro->xuxemon->id,
                'nombre' => $registro->xuxemon->nombre,
                'tipo' => $registro->xuxemon->tipo,
                'descripcion' => $registro->xuxemon->descripcion,
                'imagen' => $registro->imagen ?: $registro->xuxemon->imagen,
                'tamano' => $registro->tamano,
                'comidas' => $registro->comidas,
                'created_at' => $registro->xuxemon->created_at,
                'updated_at' => $registro->xuxemon->updated_at,
            ],
        ]);
    }

    private function sincronizarXuxemonsUsuario($user): void
    {
        $entradas = $user->mochila()
            ->where('tipo', 'xuxemon')
            ->get();

        foreach ($entradas as $entrada) {
            $xuxemon = Xuxemon::where('nombre', $entrada->nombre)->first();

            if (!$xuxemon) {
                continue;
            }

            UserXuxemon::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'xuxemon_id' => $xuxemon->id,
                ],
                [
                    'tamano' => $entrada->tamano ?: 'Pequeño',
                    'comidas' => 0,
                    'imagen' => $xuxemon->imagen,
                ]
            );
        }
    }
}
