<?php

namespace App\Http\Controllers;

use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use App\Models\Config;
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    public function create(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255|unique:xuxemons,nombre',
            'tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'vida' => 'nullable|integer|min:1',
            'ataque' => 'nullable|integer|min:0',
            'defensa' => 'nullable|integer|min:0',
            'imagen' => 'required|string|max:255',
        ]);

        $xuxemon = Xuxemon::create([
            'nombre' => $data['nombre'],
            'tipo' => $data['tipo'],
            'descripcion' => $data['descripcion'] ?? null,
            'vida' => $data['vida'] ?? 100,
            'ataque' => $data['ataque'] ?? 10,
            'defensa' => $data['defensa'] ?? 10,
            'imagen' => $data['imagen'],
        ]);

        return response()->json($xuxemon, 201);
    }

    public function update(Request $request, $id)
    {
        $xuxemon = Xuxemon::findOrFail($id);

        $data = $request->validate([
            'nombre' => 'sometimes|string|max:255|unique:xuxemons,nombre,'.$xuxemon->id,
            'tipo' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string',
            'vida' => 'sometimes|integer|min:1',
            'ataque' => 'sometimes|integer|min:0',
            'defensa' => 'sometimes|integer|min:0',
            'imagen' => 'sometimes|string|max:255',
        ]);

        $xuxemon->update($data);

        return response()->json($xuxemon);
    }

    public function delete($id)
    {
        $xuxemon = Xuxemon::findOrFail($id);
        $xuxemon->delete();

        return response()->json(['message' => 'Xuxemon eliminado correctamente.']);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'tipo' => 'nullable|string|max:100',
            'tamano' => 'nullable|string|max:50',
        ]);

        $xuxemons = Xuxemon::query()
            ->when(!empty($filters['tipo']), function ($query) use ($filters) {
                $query->whereRaw('LOWER(tipo) = ?', [mb_strtolower($filters['tipo'])]);
            })
            ->when(!empty($filters['tamano']), function ($query) use ($filters) {
                $query->whereRaw('LOWER(tamano) = ?', [mb_strtolower($filters['tamano'])]);
            })
            ->get();

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
                'enfermedad' => $registro->enfermedad,
                'created_at' => $registro->xuxemon->created_at,
                'updated_at' => $registro->xuxemon->updated_at,
            ];
        }

        return response()->json($resultado);
    }

    public function alimentar(Request $request, $id)
    {
        $datos = $request->validate([
            'xuxe' => 'required|string|max:100',
            'cantidad' => 'required|integer|min:1|max:100'
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

        $itemXuxe = $user->mochila()
            ->where('nombre', $datos['xuxe'])
            ->where('tipo', '!=', 'xuxemon')
            ->first();

        if (!$itemXuxe || $itemXuxe->cantidad < $datos['cantidad']) {
            return response()->json([
                'message' => 'No tienes suficientes unidades de este objeto.'
            ], 400);
        }

        $esVacuna = str_contains(strtolower($datos['xuxe']), 'vacuna');

        // LÓGICA DE ENFERMEDAD / VACUNA
        if ($registro->enfermedad) {
            if (!$esVacuna) {
                return response()->json([
                    'message' => 'El Xuxemon está enfermo y no puede comer. ¡Cúralo primero!'
                ], 400);
            }

            // Es una vacuna -> lo curamos
            $itemXuxe->cantidad -= 1;
            if ($itemXuxe->cantidad <= 0) {
                $itemXuxe->delete();
            } else {
                $itemXuxe->save();
            }

            $registro->enfermedad = null;
            $registro->save();

            return response()->json([
                'message' => '¡Xuxemon curado con éxito!',
                'curado' => true,
                'xuxemon' => $registro
            ]);
        }

        // Si NO está enfermo pero intenta usar una vacuna
        if ($esVacuna) {
            return response()->json([
                'message' => 'El Xuxemon ya está sano, no necesita vacunas.'
            ], 400);
        }

        // LÓGICA DE ALIMENTACIÓN NORMAL (no está enfermo y no es vacuna)
        $itemXuxe->cantidad -= $datos['cantidad'];
        if ($itemXuxe->cantidad <= 0) {
            $itemXuxe->delete();
        } else {
            $itemXuxe->save();
        }

        $tamanoAnterior = $registro->tamano ?: 'Pequeño';
        $seInfecto = false;

        // Roll para nueva infección al comer
        $infectionPct = Config::getFloat('infection_pct', 0);
        if ($infectionPct > 0) {
            $roll = random_int(1, 100);
            if ($roll <= $infectionPct) {
                $registro->enfermedad = 'Resfriado';
                $seInfecto = true;
            }
        }

        // Solo aumenta comidas si no se infectó en este momento
        $registro->comidas = ($registro->comidas ?? 0) + $datos['cantidad'];

        // Evolución
        $evolveBase = Config::getInt('evolve_xuxes', 3);
        if ($evolveBase < 1) $evolveBase = 3;

        $toMediano = $evolveBase;
        $toGrande = $evolveBase + 2;

        if ($registro->comidas >= $toGrande) {
            $registro->tamano = 'Grande';
        } elseif ($registro->comidas >= $toMediano) {
            $registro->tamano = 'Mediano';
        } else {
            $registro->tamano = 'Pequeño';
        }

        $registro->save();

        // Sincronizar tamaño con la mochila
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
            'se_infecto' => $seInfecto,
            'xuxemon' => $registro
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
                    'enfermedad' => null,
                ]
            );
        }
    }
}
