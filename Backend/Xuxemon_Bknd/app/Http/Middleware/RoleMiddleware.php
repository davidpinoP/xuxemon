<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
  public function handle(Request $request, Closure $next, string $role): Response
{
    // Verificamos si el usuario está logueado y si tiene el rol necesario
    if (!$request->user() || $request->user()->role !== $role) {
        return response()->json([
            'message' => 'No tienes permisos para realizar esta acción (Se requiere rol: ' . $role . ')'
        ], 403);
    }

    return $next($request);
}
}
