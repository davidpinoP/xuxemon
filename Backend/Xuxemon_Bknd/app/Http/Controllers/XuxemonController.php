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

        // Bloquear alimentar si el Xuxemon ya está enfermo
        if ($xuxemon->enfermedad) {
            return response()->json([
                'message' => 'No puedes alimentar al Xuxemon porque tiene ' . $xuxemon->enfermedad . '. ¡Cúralo primero!'
            ], 403);
        }

        //  Probabilidad de enfermedad al comer 5% / 10% / 15%
        // Recogemos el nombre de la chuche que envía Angular
        $nombreChuche = strtolower($request->input('xuxe', '')); 
        
        $riesgo = 5; // Por defecto
        if (str_contains($nombreChuche, 'caramelo')) {
            $riesgo = 5;
        } elseif (str_contains($nombreChuche, 'choco')) {
            $riesgo = 10;
        } elseif (str_contains($nombreChuche, 'menta')) {
            $riesgo = 15;
        }

        // Tiramos el dado virtual del 1 al 100
        $probabilidad = rand(1, 100);
        $enfermedad = null;

        if ($probabilidad <= $riesgo) {
            $enfermedad = 'Atracón'; // Le asignamos la enfermedad fija
        }

        if ($enfermedad) {
            $xuxemon->enfermedad = $enfermedad;
            $xuxemon->save();

            return response()->json([
                'message' => 'El Xuxemon ha comido, pero... ¡Oh no! Se ha enfermado con un ' . $enfermedad . '.',
                'estado' => 'enfermo',
                'enfermedad' => $enfermedad,
                'xuxemon' => $xuxemon
            ], 200);
        }

        // Guardamos si no se ha enfermado
        $xuxemon->save();

        return response()->json([
            'message' => 'Xuxemon alimentado con éxito. ¡Está sanísimo!',
            'estado' => 'sano',
            'xuxemon' => $xuxemon
        ], 200);
    }

    // Endpoint para usar vacunas 
    {
        $xuxemon = Xuxemon::findOrFail($id);

        if ($xuxemon->enfermedad === null) {
            return response()->json([
                'message' => 'Este Xuxemon ya está sano, no necesita vacunas.',
                'estado' => 'sano'
            ], 400); 
        }

        $vacunaUsada = $request->input('vacuna', 'Vacuna Estándar'); 

        // Curamos la enfermedad
        $xuxemon->enfermedad = null;
        $xuxemon->save();

        return response()->json([
            'message' => '¡Éxito! El Xuxemon ha sido curado usando ' . $vacunaUsada . '.',
            'estado' => 'sano',
            'xuxemon' => $xuxemon
        ], 200);
    }
}