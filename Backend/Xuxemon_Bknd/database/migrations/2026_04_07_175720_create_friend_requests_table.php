<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friend_requests', function (Blueprint $table) {
            $table->id();
            
            // Quién envía y quién recibe 
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            
            // Estado de la solicitud
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            
            $table->timestamps();

            //  Evitar que el usuario A le mande 50 solicitudes al usuario B
            $table->unique(['sender_id', 'receiver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friend_requests');
    }
};