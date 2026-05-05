<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AutenticatorController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\XuxemonController;
use Illuminate\Support\Facades\Route;

// Rutas publicas: no requieren token porque son la puerta de entrada a la app.
Route::post('/login', [AutenticatorController::class, 'login']);
Route::post('/register', [AutenticatorController::class, 'apiRegister']);

// A partir de aqui todo requiere JWT valido y que la cuenta siga activa.
Route::middleware([
    \App\Http\Middleware\ApiAuthMiddleware::class,
    \App\Http\Middleware\IsActiveMiddleware::class,
])->group(function () {
    Route::get('/me', [AutenticatorController::class, 'me']);
    Route::post('/logout', [AutenticatorController::class, 'logout']);

    Route::get('/user/profile', [UserController::class, 'show']);
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/user/deactivate', [UserController::class, 'deactivate']);
    Route::get('/friends/search', [UserController::class, 'searchUsers']);

    Route::get('/user/check-rewards', [UserController::class, 'checkRewards']);
    Route::post('/user/claim-reward', [UserController::class, 'claimReward']);

    Route::get('/configs', [ConfigController::class, 'publicIndex']);

    // Catalogo general y coleccion propia del jugador.
    Route::get('/xuxemons', [XuxemonController::class, 'index']);
    Route::get('/user/xuxemons', [XuxemonController::class, 'misXuxemons']);
    Route::post('/xuxemons/{id}/alimentar', [XuxemonController::class, 'alimentar']);

    // Se mantienen rutas legacy y limpias para no romper frontend mientras evoluciona el proyecto.
    Route::post('/friend-requests/send', [FriendRequestController::class, 'send']);
    Route::get('/friend-requests/pending', [FriendRequestController::class, 'pending']);
    Route::post('/friend-requests/{id}/accept', [FriendRequestController::class, 'accept']);
    Route::post('/friend-requests/{id}/reject', [FriendRequestController::class, 'reject']);

    Route::post('/friend-requests', [FriendRequestController::class, 'send']);
    Route::get('/friend-requests', [FriendRequestController::class, 'pending']);
    Route::put('/friend-requests/{id}/accept', [FriendRequestController::class, 'accept']);
    Route::delete('/friend-requests/{id}', [FriendRequestController::class, 'destroy']);

    Route::get('/amigos', [FriendController::class, 'index']);
    Route::delete('/amigos/{id}', [FriendController::class, 'destroy']);
    Route::get('/friends', [FriendController::class, 'index']);
    Route::delete('/friends/{id}', [FriendController::class, 'destroy']);

    // El panel admin tiene una proteccion extra por rol.
    Route::middleware([\App\Http\Middleware\RoleMiddleware::class . ':admin'])->group(function () {
        Route::post('/xuxemons', [XuxemonController::class, 'create']);
        Route::put('/xuxemons/{id}', [XuxemonController::class, 'update']);
        Route::delete('/xuxemons/{id}', [XuxemonController::class, 'delete']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users/{id}/inventory', [UserController::class, 'updateInventory']);
        Route::put('/users/{id}/inventory/{itemName}', [UserController::class, 'modifyItemInInventory']);
        Route::delete('/users/{id}/inventory/{itemName}', [UserController::class, 'deleteItemFromInventory']);
        Route::post('/users/{id}/restore', [UserController::class, 'restoreUser']);
        Route::post('/users/{id}/deactivate', [UserController::class, 'deactivateUser']);

        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Bienvenido, Administrador']);
        });

        Route::post('/admin/dar-chuches', [AdminController::class, 'darChuches']);
        Route::post('/admin/dar-xuxemon-aleatorio', [AdminController::class, 'darXuxemonAleatorio']);
        Route::post('/admin/dar-vacuna', [AdminController::class, 'darVacuna']);

        Route::get('/admin/configs', [ConfigController::class, 'index']);
        Route::post('/admin/configs', [ConfigController::class, 'store']);
    });
});
