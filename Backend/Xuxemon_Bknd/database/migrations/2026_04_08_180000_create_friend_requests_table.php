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
        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            // ID del usuario que envía la solicitud
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            // ID del usuario que recibe la solicitud
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            // Estado de la solicitud: 'pending', 'accepted', 'rejected'
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            // Evitar que el mismo usuario le envíe varias solicitudes al mismo destinatario
            $table->unique(['sender_id', 'receiver_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friend_requests');
    }
};
