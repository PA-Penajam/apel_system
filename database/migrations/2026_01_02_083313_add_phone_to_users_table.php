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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('gender')->nullable()->after('phone'); // 'L' or 'P'
            $table->string('jenis_pegawai')->nullable()->after('gender'); // 'Hakim', 'PNS', 'CPNS', 'PPPK'
            $table->string('jenis_jabatan')->nullable()->after('jenis_pegawai'); // 'pimpinan', 'Struktural', 'Fungsional', 'Staff'
            $table->string('nip')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'gender', 'jenis_pegawai', 'jenis_jabatan']);
        });
    }
};
