<?php

use App\Http\Controllers\AutenticatorController;
use App\Http\Controllers\UserController;
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

    // --- Endpoints de Xuxemons ---
    // Lectura (accesible para cualquier rol logueado)
    Route::get('/xuxemons', [XuxemonController::class, 'index']);
    Route::get('/xuxemons/{id}', [XuxemonController::class, 'show']);

    // Escritura/Borrado (Solo Administradores)
    Route::middleware('role:admin')->group(function () {
        Route::post('/xuxemons', [XuxemonController::class, 'create']);
        Route::put('/xuxemons/{id}', [XuxemonController::class, 'update']);
        Route::delete('/xuxemons/{id}', [XuxemonController::class, 'delete']);
        
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Bienvenido, Administrador']);
        });
    });
});
