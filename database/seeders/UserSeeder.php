<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class UserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed users from master.xlsx
     */
    public function run(): void
    {
        $filePath = base_path('master.xlsx');

        if (! file_exists($filePath)) {
            $this->command->error('master.xlsx tidak ditemukan!');

            return;
        }

        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        // Skip header row (index 0)
        $headerSkipped = false;

        foreach ($rows as $index => $row) {
            if (! $headerSkipped) {
                $headerSkipped = true;

                continue;
            }

            if (empty($row[2])) { // Skip if no name
                continue;
            }

            // Extract data from columns
            // Col 1: No, Col 2: NIP, Col 3: Nama & Gel, Col 4: Jabatan, Col 5: Unit Kerja
            // Col 6: TMT, Col 7: Gol, Col 8: Jenis Pegawai, Col 9: jenis_jabatan

            $nip = (string) $row[1];
            $name = trim($row[2]);
            $jabatan = trim($row[3]);
            $unitKerja = trim($row[4]);
            $golongan = trim($row[6]);
            $jenisPegawai = trim($row[7]); // Hakim, PNS, CPAPES, PPPK
            $jenisJabatan = strtolower(trim($row[8])); // pimpinan, Struktural, Fungsional, Staff

            // Determine gender from name
            $gender = $this->determineGender($name);

            // Create email from NIP (if available)
            $email = ! empty($nip) ? $nip.'@pa-penajam.go.id' : null;

            // Default password for all users
            $password = Hash::make('password123');

            User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'nip' => $nip,
                    'jabatan' => $jabatan,
                    'unit_id' => $this->getUnitId($unitKerja),
                    'role' => 'pegawai',
                    'password' => $password,
                    'gender' => $gender,
                    'jenis_pegawai' => $jenisPegawai,
                    'jenis_jabatan' => $jenisJabatan,
                    'phone' => null, // To be filled manually
                ]
            );

            $this->command->info("Created/Updated: {$name} ({$jenisPegawai} - {$jenisJabatan})");
        }

        $this->command->info('User seeding completed!');
    }

    /**
     * Determine gender from name
     */
    protected function determineGender(string $name): string
    {
        // Female markers
        $femaleMarkers = ['PUTRI', 'NURUL', 'FITRIANI', 'KHOFIFAH', 'NASUHA', 'YUSTISIA',
            'FARIDAH', 'YULIANA', 'MAULIDINA', 'PRAMESTI', 'HIJRIANA',
            'NOVAYANTI', 'NUR AINI', 'NUR MUFLIHAH'];

        // Check for female markers
        $nameUpper = strtoupper($name);
        foreach ($femaleMarkers as $marker) {
            if (str_contains($nameUpper, $marker)) {
                return 'P';
            }
        }

        // Default to male if no female marker found
        return 'L';
    }

    /**
     * Get unit ID from unit kerja name
     */
    protected function getUnitId(string $unitKerja): int
    {
        return match ($unitKerja) {
            'Pengadilan Agama Penajam' => 1,
            'Kepaniteraan' => 2,
            'Kesekretariatan' => 3,
            'Panmud Gugatan' => 4,
            'Panmud Hukum' => 5,
            'Panmud Permohonan' => 6,
            'Subbagian PTIP' => 7,
            'Subbagian Umum' => 8,
            'Subbagian Kepegawaian' => 9,
            default => 1,
        };
    }
}
