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
        Schema::create('amigos', function (Blueprint $table) {
            $table->id();
            
            // Relación bidireccional
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('amigo_id')->constrained('users')->onDelete('cascade');
            
            $table->timestamps();

            // Unicidad para evitar duplicados
            $table->unique(['user_id', 'amigo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('amigos');
    }
};
