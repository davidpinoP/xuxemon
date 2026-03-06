<?php

use App\Http\Controllers\AutenticatorController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\XuxemonController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Pública
Route::post('/login', [AutenticatorController::class, 'login']);
Route::post('/register', [AutenticatorController::class, 'apiRegister']);

// Protegidas (Requieren Login)
Route::middleware('ApiAuth')->group(function () {
    Route::get('/me', [AutenticatorController::class, 'me']);

    // Perfil de usuario
    Route::get('/user/profile', [UserController::class, 'show']);
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/user/deactivate', [UserController::class, 'deactivate']);

    // Xuxemons
    Route::get('/xuxemons', [XuxemonController::class, 'index']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/xuxemons', [XuxemonController::class, 'create']);
        Route::put('/xuxemons/{id}', [XuxemonController::class, 'update']);
        Route::delete('/xuxemons/{id}', [XuxemonController::class, 'delete']);

        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Bienvenido, Administrador']);
        });

        // Funciones del Nivel 2 para el admin
        Route::post('/admin/dar-chuches', [AdminController::class, 'darChuches']);
        Route::post('/admin/dar-xuxemon-aleatorio', [AdminController::class, 'darXuxemonAleatorio']);
    });
});
