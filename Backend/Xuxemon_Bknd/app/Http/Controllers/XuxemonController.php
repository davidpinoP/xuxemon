<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;
use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    private const DISEASE_SUGAR_LOW = 'Bajon de azucar';
    private const DISEASE_SUGAR_OVERDOSE = 'Sobredosis de sucre';
    private const DISEASE_BINGE = 'Atracon';

    private const DISEASE_WEIGHTS = [
        self::DISEASE_SUGAR_LOW => 5,
        self::DISEASE_SUGAR_OVERDOSE => 10,
        self::DISEASE_BINGE => 15,
    ];

    private const VACCINE_CURES = [
        'xocolatina' => [self::DISEASE_SUGAR_LOW],
        'xal de fruites' => [self::DISEASE_BINGE],
        'inxulina' => [
            self::DISEASE_SUGAR_LOW,
            self::DISEASE_SUGAR_OVERDOSE,
            self::DISEASE_BINGE,
        ],
    ];

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
            'nombre' => 'sometimes|string|max:255|unique:xuxemons,nombre,' . $xuxemon->id,
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
                'tamano' => $registro?->tamano ?: 'Pequeno',
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

            $resultado[] = [
                'id' => $registro->xuxemon->id,
                'nombre' => $registro->xuxemon->nombre,
                'tipo' => $registro->xuxemon->tipo,
                'descripcion' => $registro->xuxemon->descripcion,
                'imagen' => $registro->imagen ?: $registro->xuxemon->imagen,
                'tamano' => $registro->tamano ?: 'Pequeno',
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

        $item = $user->mochila()
            ->where('nombre', $datos['xuxe'])
            ->where('tipo', '!=', 'xuxemon')
            ->first();

        if (!$item || $item->cantidad < $datos['cantidad']) {
            return response()->json([
                'message' => 'No tienes suficientes unidades de este objeto.'
            ], 400);
        }

        $vaccineKey = $this->resolveVaccineKey($datos['xuxe']);
        $isVaccine = $vaccineKey !== null;

        if ($isVaccine) {
            if (!$registro->enfermedad) {
                return response()->json([
                    'message' => 'El Xuxemon ya esta sano, no necesita vacunas.'
                ], 400);
            }

            if (!$this->canVaccineCureDisease($vaccineKey, $registro->enfermedad)) {
                return response()->json([
                    'message' => 'Esta vacuna no cura la enfermedad actual del Xuxemon.'
                ], 400);
            }

            $this->consumeInventoryItem($item, 1);
            $registro->enfermedad = null;
            $registro->save();

            return response()->json([
                'message' => 'Xuxemon curado con exito.',
                'curado' => true,
                'xuxemon' => $registro
            ]);
        }

        if ($registro->enfermedad === self::DISEASE_BINGE) {
            return response()->json([
                'message' => 'El Xuxemon tiene Atracon y no puede alimentarse hasta que lo cures.'
            ], 400);
        }

        $this->consumeInventoryItem($item, $datos['cantidad']);

        $tamanoAnterior = $registro->tamano ?: 'Pequeno';
        $seInfecto = false;

        $infectionPct = Config::getFloat('infection_pct', 0);
        if ($infectionPct > 0) {
            $roll = random_int(1, 100);
            if ($roll <= $infectionPct) {
                $registro->enfermedad = $this->pickRandomDisease();
                $seInfecto = true;
            }
        }

        $registro->comidas = ($registro->comidas ?? 0) + $datos['cantidad'];

        [$toMediano, $toGrande] = $this->getEvolutionThresholds($registro);

        if ($registro->comidas >= $toGrande) {
            $registro->tamano = 'Grande';
        } elseif ($registro->comidas >= $toMediano) {
            $registro->tamano = 'Mediano';
        } else {
            $registro->tamano = 'Pequeno';
        }

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
            'se_infecto' => $seInfecto,
            'enfermedad' => $registro->enfermedad,
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
                    'tamano' => $entrada->tamano ?: 'Pequeno',
                    'comidas' => 0,
                    'imagen' => $xuxemon->imagen,
                    'enfermedad' => null,
                ]
            );
        }
    }

    private function resolveVaccineKey(string $itemName): ?string
    {
        $normalized = mb_strtolower(trim($itemName));
        $normalized = preg_replace('/^vacuna\s+/u', '', $normalized ?? '');

        return array_key_exists($normalized, self::VACCINE_CURES) ? $normalized : null;
    }

    private function canVaccineCureDisease(string $vaccineKey, ?string $disease): bool
    {
        if ($disease === null) {
            return false;
        }

        return in_array($disease, self::VACCINE_CURES[$vaccineKey], true);
    }

    private function consumeInventoryItem($item, int $amount): void
    {
        $item->cantidad -= $amount;

        if ($item->cantidad <= 0) {
            $item->delete();
            return;
        }

        $item->save();
    }

    private function pickRandomDisease(): string
    {
        $roll = random_int(1, array_sum(self::DISEASE_WEIGHTS));
        $current = 0;

        foreach (self::DISEASE_WEIGHTS as $disease => $weight) {
            $current += $weight;
            if ($roll <= $current) {
                return $disease;
            }
        }

        return self::DISEASE_SUGAR_LOW;
    }

    private function getEvolutionThresholds(UserXuxemon $registro): array
    {
        $base = Config::getInt('evolve_xuxes', 3);
        $safeBase = $base > 0 ? $base : 3;
        $toMediano = $safeBase;
        $toGrande = $safeBase + 2;

        if ($registro->enfermedad === self::DISEASE_SUGAR_LOW) {
            $toMediano += 2;
            $toGrande += 4;
        }

        return [$toMediano, $toGrande];
    }
}
