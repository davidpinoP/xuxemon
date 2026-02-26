<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    
    // Ver datos del perfil
    Route::get('/user/profile', [UserController::class, 'show']);
    
    // Actualizar datos (nombre, apellidos, etc.)
    Route::put('/user/update', [UserController::class, 'update']);
    
    // Baja lógica (is_active = false)
    Route::post('/user/deactivate', [UserController::class, 'deactivate']);
});