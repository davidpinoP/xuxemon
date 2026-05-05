<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\UserNotDefinedException;

class ApiAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // userOrFail valida el JWT del guard "api" y resuelve el usuario autenticado.
            auth('api')->userOrFail();
        } catch (TokenExpiredException $e) {
            return response()->json([
                'message' => 'No autorizado: el token ha expirado.'
            ], 401);
        } catch (UserNotDefinedException $e) {
            return response()->json([
                'message' => 'No autorizado: token invalido o ausente.'
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                'message' => 'No autorizado: no se pudo validar el token.'
            ], 401);
        }

        return $next($request);
    }
}
