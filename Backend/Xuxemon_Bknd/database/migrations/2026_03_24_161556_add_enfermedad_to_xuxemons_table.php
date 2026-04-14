<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('xuxemons', function (Blueprint $table) {
            if (!Schema::hasColumn('xuxemons', 'tamano')) {
                $table->string('tamano')->default('Pequeño')->after('imagen');
            }
            if (!Schema::hasColumn('xuxemons', 'enfermedad')) {
                $table->string('enfermedad')->nullable()->after('tamano');
            }
        });
    }

    public function down(): void
    {
        Schema::table('xuxemons', function (Blueprint $table) {
            if (Schema::hasColumn('xuxemons', 'enfermedad')) {
                $table->dropColumn('enfermedad');
            }
            if (Schema::hasColumn('xuxemons', 'tamano')) {
                $table->dropColumn('tamano');
            }
        });
    }
};