<?php

use App\Http\Controllers\AutenticatorController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Pública
Route::post('/login', [AutenticatorController::class, 'login']);

// Protegidas
Route::middleware('ApiAuth')->group(function () {
    Route::get('/me', [AutenticatorController::class, 'me']);
    Route::get('/user/profile', [UserController::class, 'show']);
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/user/deactivate', [UserController::class, 'deactivate']);

    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Bienvenido, Administrador']);
        });
    });

});
Route::post('/register', [AutenticatorController::class, 'apiRegister']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/profile', [UserController::class, 'show']);
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/user/deactivate', [UserController::class, 'deactivate']);
});
