<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $mapping = [
            'pimpinan' => 'Pimpinan',
            'struktural' => 'Struktural',
            'fungsional' => 'Fungsional',
            'staff' => 'Staff',
        ];

        foreach ($mapping as $from => $to) {
            DB::table('users')
                ->whereRaw('LOWER(jenis_jabatan) = ?', [$from])
                ->update(['jenis_jabatan' => $to]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data normalization is not reversible without a snapshot.
    }
};
