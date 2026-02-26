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
        // Solo añade 'surname' si NO existe
        if (!Schema::hasColumn('users', 'surname')) {
            $table->string('surname')->nullable()->after('name');
        }

        // Solo añade 'is_active' si NO existe
        if (!Schema::hasColumn('users', 'is_active')) {
            $table->boolean('is_active')->default(true)->after('password');
        }

        // Solo añade 'repetir_password' si NO existe
        if (!Schema::hasColumn('users', 'repetir_password')) {
            $table->string('repetir_password')->nullable()->after('password');
        }
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn(['surname', 'is_active', 'repetir_password']);
    });
}
};
