<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $legacyEntries = DB::table('mochilas')
            ->where('tipo', 'item')
            ->where('nombre', 'Xuxe')
            ->get();

        foreach ($legacyEntries as $entry) {
            $existing = DB::table('mochilas')
                ->where('user_id', $entry->user_id)
                ->where('tipo', 'item')
                ->where('nombre', 'Xuxe Caramelo')
                ->first();

            if ($existing) {
                DB::table('mochilas')
                    ->where('id', $existing->id)
                    ->update([
                        'cantidad' => $existing->cantidad + $entry->cantidad,
                        'updated_at' => now(),
                    ]);

                DB::table('mochilas')
                    ->where('id', $entry->id)
                    ->delete();

                continue;
            }

            DB::table('mochilas')
                ->where('id', $entry->id)
                ->update([
                    'nombre' => 'Xuxe Caramelo',
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // No reversible safely: the migration may merge legacy and current stacks.
    }
};
