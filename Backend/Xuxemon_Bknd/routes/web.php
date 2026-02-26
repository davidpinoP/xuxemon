<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticatorController;

Route::get('/', function () {
    return view('welcome');
});

// Auth routes
Route::get('/register', [AutenticatorController::class, 'showRegister'])->name('register.form');
Route::post('/register', [AutenticatorController::class, 'register'])->name('register');

Route::get('/login', [AutenticatorController::class, 'showLogin'])->name('login');
Route::post('/login', [AutenticatorController::class, 'login'])->name('login.post');

Route::post('/logout', [AutenticatorController::class, 'logout'])->name('logout');

Route::get('/dashboard', [AutenticatorController::class, 'dashboard'])->name('dashboard')->middleware('auth');
