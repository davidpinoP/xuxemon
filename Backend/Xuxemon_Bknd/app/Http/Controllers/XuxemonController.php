<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Xuxemon;

class XuxemonController extends Controller
{
    public function index()
    {
        $xuxemons = Xuxemon::all();
        return response()->json($xuxemons);
    }

    public function show($id)
    {
        $xuxemon = Xuxemon::find($id);
        if (!$xuxemon) {
            return response()->json(['message' => 'Xuxemon no encontrado'], 404);
        }
        return response()->json($xuxemon);
    }

    public function create(Request $request)
    {
        $xuxemon = Xuxemon::create($request->all());
        return response()->json($xuxemon, 201);
    }

    public function update(Request $request, $id)
    {
        $xuxemon = Xuxemon::find($id);
        if (!$xuxemon) {
            return response()->json(['message' => 'Xuxemon no encontrado'], 404);
        }
        $xuxemon->update($request->all());
        return response()->json($xuxemon);
    }

    public function delete($id)
    {
        $xuxemon = Xuxemon::find($id);
        if (!$xuxemon) {
            return response()->json(['message' => 'Xuxemon no encontrado'], 404);
        }
        $xuxemon->delete();
        return response()->json(['message' => 'Xuxemon eliminado']);
    }
}
