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
        // Añadimos surname después de name
        $table->string('surname')->nullable()->after('name');
        
        // Añadimos is_active después de password (por defecto true)
        $table->boolean('is_active')->default(true)->after('password');
        
        // Si necesitas 'repetir_password' en la base de datos (aunque no es común)
        $table->string('repetir_password')->nullable()->after('password');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['surname', 'is_active', 'repetir_password']);
    });
}
};
