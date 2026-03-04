<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
        return response()->json($xuxemon);
    }

    public function store(Request $request)
    {
        $xuxemon = Xuxemon::create($request->all());
        return response()->json($xuxemon);
    }

    public function update(Request $request, $id)
    {
        $xuxemon = Xuxemon::find($id);
        $xuxemon->update($request->all());
        return response()->json($xuxemon);
    }

    public function destroy($id)
    {
        $xuxemon = Xuxemon::find($id);
        $xuxemon->delete();
        return response()->json($xuxemon);
    }
}
