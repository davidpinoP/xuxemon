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
});