<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Añadimos el apellido después del nombre
        $table->string('last_name')->nullable()->after('name');
        // Añadimos si está activo o no (por defecto true)
        $table->boolean('is_active')->default(true)->after('password');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['last_name', 'is_active']);
    });
}
};
