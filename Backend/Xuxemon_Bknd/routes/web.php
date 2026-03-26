<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticatorController;
use App\Http\Controllers\XuxemonController;


Route::get('/', function () {
    return view('welcome');
});

