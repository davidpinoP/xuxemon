<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Item;
$items = Item::all();
foreach ($items as $item) {
    echo "ID: {$item->id}, Name: {$item->nombre}\n";
}
