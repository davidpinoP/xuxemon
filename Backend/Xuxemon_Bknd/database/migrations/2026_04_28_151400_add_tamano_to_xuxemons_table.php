<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('xuxemons', 'tamano')) {
            return;
        }

        Schema::table('xuxemons', function (Blueprint $table) {
            $table->string('tamano')->nullable()->after('imagen');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('xuxemons', 'tamano')) {
            return;
        }

        Schema::table('xuxemons', function (Blueprint $table) {
            $table->dropColumn('tamano');
        });
    }
};
