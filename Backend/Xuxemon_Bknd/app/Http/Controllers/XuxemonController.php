<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;

class XuxemonController extends Controller
{
    // Devuelve todos los xuxemons del catalogo
    public function index()
    {
        $xuxemons = Xuxemon::all();
        return response()->json($xuxemons);
    }
}
