<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\UserNotDefinedException;

class ApiAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Intentamos obtener el usuario autenticado vía JWT
            // userOrFail lanza UserNotDefinedException si el token es inválido o no existe
            $user = auth('api')->userOrFail();
        } catch (UserNotDefinedException $e) {
            return response()->json([
                'message' => 'No autorizado (Token inválido o ausente)'
            ], 401);
        }

        return $next($request);
    }
}
