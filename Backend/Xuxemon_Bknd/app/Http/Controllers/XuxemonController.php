<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;
use Illuminate\Http\Request; 

class XuxemonController extends Controller
{
    public function index()
    {
        $xuxemons = Xuxemon::all();
        return response()->json($xuxemons);
    }

    public function alimentar(Request $request, $id)
    {
        $xuxemon = Xuxemon::findOrFail($id);

        $probabilidad = rand(1, 100);
        $enfermedad = null;

        if ($probabilidad <= 5) {
            $enfermedad = 'Sobredosis de Azúcar';
        } elseif ($probabilidad > 5 && $probabilidad <= 15) {
            $enfermedad = 'Indigestión';
        } elseif ($probabilidad > 15 && $probabilidad <= 30) {
            $enfermedad = 'Atracón';
        }

        if ($enfermedad) {
            $xuxemon->enfermedad = $enfermedad;
        }

        $xuxemon->save();

        if ($enfermedad) {
            return response()->json([
                'message' => 'El Xuxemon ha comido, pero... ¡Oh no! Se ha enfermado.',
                'estado' => 'enfermo',
                'enfermedad' => $enfermedad,
                'xuxemon' => $xuxemon
            ], 200);
        }

        return response()->json([
            'message' => 'Xuxemon alimentado con éxito. ¡Está sanísimo!',
            'estado' => 'sano',
            'xuxemon' => $xuxemon
        ], 200);
    }

    public function aplicarVacuna(Request $request, $id)
    {
        $xuxemon = Xuxemon::findOrFail($id);

        if ($xuxemon->enfermedad === null) {
            return response()->json([
                'message' => 'Este Xuxemon ya está sano, no necesita vacunas.',
                'estado' => 'sano'
            ], 400); 
        }

        $vacunaUsada = $request->input('vacuna'); 


        $xuxemon->enfermedad = null;
        $xuxemon->save();

        return response()->json([
            'message' => '¡Éxito! El Xuxemon ha sido curado usando ' . $vacunaUsada . '.',
            'estado' => 'sano',
            'xuxemon' => $xuxemon
        ], 200);
    }

} 