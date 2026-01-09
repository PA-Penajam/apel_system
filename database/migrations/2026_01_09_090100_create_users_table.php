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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('gender')->nullable(); // 'L' or 'P'
            $table->string('jenis_pegawai')->nullable(); // 'Hakim', 'PNS', 'CPNS', 'PPPK'
            $table->string('jenis_jabatan')->nullable(); // 'pimpinan', 'Struktural', 'Fungsional', 'Staff'
            $table->string('nip')->nullable();
            $table->string('jabatan')->nullable(); // Jabatan struktural
            $table->unsignedBigInteger('unit_id')->nullable(); // Unit kerja
            $table->string('role')->default('pegawai');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
