<?php

use App\Http\Controllers\AutenticatorController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\XuxemonController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Pública
Route::post('/login', [AutenticatorController::class, 'login']);
Route::post('/register', [AutenticatorController::class, 'apiRegister']);

// Protegidas (Requiere Token + Cuenta Activa)
Route::middleware([\App\Http\Middleware\ApiAuthMiddleware::class, \App\Http\Middleware\IsActiveMiddleware::class])->group(function () {
    Route::get('/me', [AutenticatorController::class, 'me']);
    
    // Perfil de usuario (Gestionar el suyo propio)
    Route::get('/user/profile', [UserController::class, 'show']);
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/user/deactivate', [UserController::class, 'deactivate']);

    // --- Endpoints de Xuxemons ---
    // Lectura (accesible para cualquier usuario autenticado y activo)
    Route::get('/xuxemons', [XuxemonController::class, 'index']);

    Route::middleware([\App\Http\Middleware\RoleMiddleware::class.':admin'])->group(function () {
        Route::post('/xuxemons', [\App\Http\Controllers\XuxemonController::class, 'create']);
        Route::put('/xuxemons/{id}', [\App\Http\Controllers\XuxemonController::class, 'update']);
        Route::delete('/xuxemons/{id}', [\App\Http\Controllers\XuxemonController::class, 'delete']);
        
        // Gestión de Usuarios e Inventarios
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users/{id}/inventory', [UserController::class, 'updateInventory']);
        Route::put('/users/{id}/inventory/{itemName}', [UserController::class, 'modifyItemInInventory']);
        Route::delete('/users/{id}/inventory/{itemName}', [UserController::class, 'deleteItemFromInventory']);

        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Bienvenido, Administrador']);
        });

        // admin: chuches, xuxemons y vacunas
        Route::post('/admin/dar-chuches', [AdminController::class, 'darChuches']);
        Route::post('/admin/dar-xuxemon-aleatorio', [AdminController::class, 'darXuxemonAleatorio']);
        Route::post('/admin/users/{id}/vaccine', [AdminController::class, 'darVacuna']);

        // admin: configuracion global
        Route::get('/admin/configs', [ConfigController::class, 'index']);
        Route::post('/admin/configs', [ConfigController::class, 'store']);
    });
});
