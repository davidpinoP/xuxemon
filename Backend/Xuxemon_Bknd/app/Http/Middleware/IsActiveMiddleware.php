<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsActiveMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // El usuario ya debe estar autenticado por ApiAuth antes de este middleware
        $user = $request->user();

        if (!$user || !$user->is_active) {
            return response()->json([
                'message' => 'Acceso denegado: Tu cuenta está desactivada'
            ], 403);
        }

        return $next($request);
    }
}
