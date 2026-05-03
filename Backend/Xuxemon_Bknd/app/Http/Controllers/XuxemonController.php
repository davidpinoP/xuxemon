<?php

namespace App\Http\Controllers;

use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use App\Models\Config;
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    private const LEGACY_XUXE_NAME = 'Xuxe';
    private const DISEASE_BAJON = 'Bajón de azúcar';
    private const DISEASE_SOBREDOSIS = 'Sobredosis de sucre';
    private const DISEASE_ATRACON = 'Atracón';

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

        $user = $request->user();

        if ($user) {
            $this->sincronizarXuxemonsUsuario($user);
        }

        $catalogo = Xuxemon::query()
            ->when(!empty($filters['tipo']), function ($query) use ($filters) {
                $query->whereRaw('LOWER(tipo) = ?', [mb_strtolower($filters['tipo'])]);
            })
            ->when(!empty($filters['tamano']), function ($query) use ($filters) {
                $query->whereRaw('LOWER(tamano) = ?', [mb_strtolower($filters['tamano'])]);
            })
            ->get();

        if (!$user) {
            return response()->json($catalogo);
        }

        $propios = UserXuxemon::where('user_id', $user->id)
            ->get()
            ->keyBy('xuxemon_id');

        $resultado = $catalogo->map(function (Xuxemon $xuxemon) use ($propios) {
            $registro = $propios->get($xuxemon->id);

            return [
                'id' => $xuxemon->id,
                'nombre' => $xuxemon->nombre,
                'tipo' => $xuxemon->tipo,
                'descripcion' => $xuxemon->descripcion,
                'imagen' => $registro?->imagen ?: $xuxemon->imagen,
                'tamano' => $registro?->tamano ?: 'Pequeño',
                'comidas' => $registro?->comidas ?? 0,
                'enfermedad' => $registro?->enfermedad,
                'desbloqueado' => (bool) $registro,
                'bloqueado' => !$registro,
                'created_at' => $xuxemon->created_at,
                'updated_at' => $xuxemon->updated_at,
            ];
        });

        return response()->json($resultado);
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

            $cantidad = (int) $user->mochila()
                ->where('tipo', 'xuxemon')
                ->where('nombre', $registro->xuxemon->nombre)
                ->sum('cantidad');

            $enfermedades = $this->getDiseaseList($registro);

            $resultado[] = [
                'id' => $registro->xuxemon->id,
                'nombre' => $registro->xuxemon->nombre,
                'tipo' => $registro->xuxemon->tipo,
                'descripcion' => $registro->xuxemon->descripcion,
                'imagen' => $registro->imagen ?: $registro->xuxemon->imagen,
                'tamano' => $this->normalizeSize($registro->tamano ?: 'Pequeño'),
                'comidas' => $registro->comidas ?? 0,
                'cantidad' => max(1, $cantidad),
                'enfermedades' => $enfermedades,
                'enfermedad' => $enfermedades[0] ?? null,
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

        $itemXuxe = $this->findInventoryItem($user, $datos['xuxe']);

        if (!$itemXuxe || $itemXuxe->cantidad < $datos['cantidad']) {
            return response()->json([
                'message' => 'No tienes suficientes unidades de este objeto.'
            ], 400);
        }

        // Vacunas validas y qué enfermedad cura cada una
        $vacunas = [
            'Xocolatina'     => self::DISEASE_BAJON,
            'Xal de fruites' => self::DISEASE_ATRACON,
            'Inxulina'       => '*',  // cura cualquier enfermedad
        ];
        $esVacuna = array_key_exists($datos['xuxe'], $vacunas);
        $enfermedadesActuales = $this->getDiseaseList($registro);

        // LÓGICA DE ENFERMEDAD / VACUNA
        if ($esVacuna && $enfermedadesActuales !== []) {
            // Comprobar si la vacuna sirve para esta enfermedad
            $cura = $vacunas[$datos['xuxe']];
            if ($cura !== '*' && !in_array($cura, $enfermedadesActuales, true)) {
                return response()->json([
                    'message' => $datos['xuxe'] . ' no cura las enfermedades actuales. Prueba con otra vacuna.'
                ], 400);
            }

            // Vacuna correcta -> curamos
            $itemXuxe->cantidad -= 1;
            if ($itemXuxe->cantidad <= 0) {
                $itemXuxe->delete();
            } else {
                $itemXuxe->save();
            }

            $enfermedadesRestantes = $cura === '*'
                ? []
                : array_values(array_filter(
                    $enfermedadesActuales,
                    fn (string $enfermedad) => $enfermedad !== $cura
                ));

            $this->syncDiseases($registro, $enfermedadesRestantes);
            $registro->save();

            return response()->json([
                'message' => '¡Xuxemon curado con ' . $datos['xuxe'] . '!',
                'curado' => true,
                'xuxemon' => $this->buildOwnedXuxemonPayload($user, $registro)
            ]);
        }

        // Si NO está enfermo pero intenta usar una vacuna
        if ($esVacuna) {
            return response()->json([
                'message' => 'El Xuxemon ya está sano, no necesita vacunas.'
            ], 400);
        }

        if (in_array(self::DISEASE_ATRACON, $enfermedadesActuales, true)) {
            return response()->json([
                'message' => 'El Xuxemon tiene Atracón y no puede alimentarse.'
            ], 400);
        }

        $registro->tamano = $this->normalizeSize($registro->tamano ?: 'Pequeño');
        $tamanoAnterior = $registro->tamano;
        $cantidadConsumida = 0;
        $seInfecto = false;
        $feedStoppedByAtracon = false;
        $nuevasEnfermedades = [];
        $registro->comidas = (int) ($registro->comidas ?? 0);

        for ($i = 0; $i < $datos['cantidad']; $i++) {
            $registro->comidas++;
            $cantidadConsumida++;

            $this->applyEvolutionProgress($registro, $enfermedadesActuales);

            foreach ($this->getDiseaseChances() as $nombre => $pct) {
                if ($pct <= 0 || in_array($nombre, $enfermedadesActuales, true)) {
                    continue;
                }

                if (random_int(1, 100) <= $pct) {
                    $enfermedadesActuales[] = $nombre;
                    $nuevasEnfermedades[] = $nombre;
                    $seInfecto = true;
                }
            }

            $enfermedadesActuales = array_values(array_unique($enfermedadesActuales));

            if (in_array(self::DISEASE_ATRACON, $nuevasEnfermedades, true) && $i < ($datos['cantidad'] - 1)) {
                $feedStoppedByAtracon = true;
                break;
            }
        }

        $this->syncDiseases($registro, $enfermedadesActuales);
        $registro->save();

        $itemXuxe->cantidad -= $cantidadConsumida;
        if ($itemXuxe->cantidad <= 0) {
            $itemXuxe->delete();
        } else {
            $itemXuxe->save();
        }

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
            'message' => $feedStoppedByAtracon
                ? 'El Xuxemon empezó a sufrir Atracón y dejó de comer antes de terminar.'
                : 'Xuxemon alimentado correctamente.',
            'evoluciono' => $tamanoAnterior !== $registro->tamano,
            'se_infecto' => $seInfecto,
            'enfermedades_nuevas' => array_values(array_unique($nuevasEnfermedades)),
            'cantidad_consumida' => $cantidadConsumida,
            'xuxemon' => $this->buildOwnedXuxemonPayload($user, $registro)
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
                    'enfermedades' => [],
                ]
            );
        }
    }

    private function findInventoryItem($user, string $itemName)
    {
        $query = $user->mochila()
            ->where('tipo', '!=', 'xuxemon');

        if ($itemName === 'Xuxe Caramelo') {
            return $query
                ->whereIn('nombre', [$itemName, self::LEGACY_XUXE_NAME])
                ->orderByRaw("nombre = ? desc", [$itemName])
                ->first();
        }

        return $query
            ->where('nombre', $itemName)
            ->first();
    }

    private function buildOwnedXuxemonPayload($user, UserXuxemon $registro): array
    {
        $cantidad = (int) $user->mochila()
            ->where('tipo', 'xuxemon')
            ->where('nombre', $registro->xuxemon->nombre)
            ->sum('cantidad');

        $enfermedades = $this->getDiseaseList($registro);

        return [
            'id' => $registro->xuxemon->id,
            'nombre' => $registro->xuxemon->nombre,
            'tipo' => $registro->xuxemon->tipo,
            'descripcion' => $registro->xuxemon->descripcion,
            'imagen' => $registro->imagen ?: $registro->xuxemon->imagen,
            'tamano' => $this->normalizeSize($registro->tamano ?: 'Pequeño'),
            'comidas' => (int) ($registro->comidas ?? 0),
            'cantidad' => max(1, $cantidad),
            'enfermedades' => $enfermedades,
            'enfermedad' => $enfermedades[0] ?? null,
            'created_at' => $registro->xuxemon->created_at,
            'updated_at' => $registro->xuxemon->updated_at,
        ];
    }

    private function getDiseaseList(UserXuxemon $registro): array
    {
        $enfermedades = $registro->enfermedades ?? [];

        if (!is_array($enfermedades)) {
            $enfermedades = [];
        }

        if ($registro->enfermedad && !in_array($registro->enfermedad, $enfermedades, true)) {
            $enfermedades[] = $registro->enfermedad;
        }

        return array_values(array_unique(array_filter($enfermedades)));
    }

    private function syncDiseases(UserXuxemon $registro, array $enfermedades): void
    {
        $enfermedades = array_values(array_unique(array_filter($enfermedades)));
        $registro->enfermedades = $enfermedades === [] ? null : $enfermedades;
        $registro->enfermedad = $enfermedades[0] ?? null;
    }

    private function getDiseaseChances(): array
    {
        return [
            self::DISEASE_BAJON => Config::getFloat('pct_bajon_azucar', 0),
            self::DISEASE_SOBREDOSIS => Config::getFloat('pct_sobredosis_sucre', 0),
            self::DISEASE_ATRACON => Config::getFloat('pct_atracon', 0),
        ];
    }

    private function applyEvolutionProgress(UserXuxemon $registro, array $enfermedades): void
    {
        while (true) {
            $tamanoActual = $this->normalizeSize($registro->tamano ?: 'Pequeño');
            $siguienteTamano = $this->getNextSize($tamanoActual);

            if (!$siguienteTamano) {
                $registro->comidas = 0;
                return;
            }

            $objetivo = $this->getStageRequirement($tamanoActual, $enfermedades);

            if ($registro->comidas < $objetivo) {
                return;
            }

            $registro->comidas -= $objetivo;
            $registro->tamano = $siguienteTamano;
        }
    }

    private function getStageRequirement(string $tamanoActual, array $enfermedades): int
    {
        $base = Config::getInt('evolve_xuxes', 3);
        $base = $base > 0 ? $base : 3;
        $tamanoActual = $this->normalizeSize($tamanoActual);

        $objetivo = $tamanoActual === 'Mediano'
            ? $base + 2
            : $base;

        if (in_array(self::DISEASE_BAJON, $enfermedades, true)) {
            $objetivo += 2;
        }

        return $objetivo;
    }

    private function getNextSize(string $tamanoActual): ?string
    {
        return match ($this->normalizeSize($tamanoActual)) {
            'Pequeño' => 'Mediano',
            'Mediano' => 'Grande',
            default => null,
        };
    }

    private function normalizeSize(string $tamano): string
    {
        $valor = mb_strtolower(trim($tamano));

        return match ($valor) {
            'pequeno', 'pequeño', 'petit', 'small' => 'Pequeño',
            'mediano', 'mediana', 'mitja', 'medium' => 'Mediano',
            'grande', 'gran', 'big', 'large' => 'Grande',
            default => 'Pequeño',
        };
    }
}
