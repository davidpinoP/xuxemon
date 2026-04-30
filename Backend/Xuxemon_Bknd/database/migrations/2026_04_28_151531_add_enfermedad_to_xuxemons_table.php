<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('xuxemons', 'enfermedad')) {
            return;
        }

        Schema::table('xuxemons', function (Blueprint $table) {
            $table->string('enfermedad')->nullable()->after('tamano');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('xuxemons', 'enfermedad')) {
            return;
        }

        Schema::table('xuxemons', function (Blueprint $table) {
            $table->dropColumn('enfermedad');
        });
    }
};
