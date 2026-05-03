<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            if (!Schema::hasColumn('user_xuxemons', 'enfermedades')) {
                $table->json('enfermedades')->nullable()->after('enfermedad');
            }
        });

        $registros = DB::table('user_xuxemons')->get();

        foreach ($registros as $registro) {
            $enfermedades = [];

            if (!empty($registro->enfermedad)) {
                $enfermedades[] = $registro->enfermedad;
            }

            $comidas = (int) ($registro->comidas ?? 0);
            $tamano = $registro->tamano ?? 'Pequeño';

            if ($tamano === 'Mediano' && $comidas >= 3) {
                $comidas -= 3;
            } elseif ($tamano === 'Grande') {
                $comidas = 0;
            }

            DB::table('user_xuxemons')
                ->where('id', $registro->id)
                ->update([
                    'comidas' => max(0, $comidas),
                    'enfermedades' => $enfermedades === [] ? null : json_encode($enfermedades, JSON_UNESCAPED_UNICODE),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            if (Schema::hasColumn('user_xuxemons', 'enfermedades')) {
                $table->dropColumn('enfermedades');
            }
        });
    }
};
