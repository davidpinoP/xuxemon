<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            if (!Schema::hasColumn('user_xuxemons', 'comidas')) {
                $table->integer('comidas')->default(0)->after('tamano');
            }

            if (!Schema::hasColumn('user_xuxemons', 'imagen')) {
                $table->string('imagen')->nullable()->after('comidas');
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            $columnsToDrop = [];

            if (Schema::hasColumn('user_xuxemons', 'comidas')) {
                $columnsToDrop[] = 'comidas';
            }

            if (Schema::hasColumn('user_xuxemons', 'imagen')) {
                $columnsToDrop[] = 'imagen';
            }

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
