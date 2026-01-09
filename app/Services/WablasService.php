<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WablasService
{
    protected string $token;
    protected string $deviceToken;
    protected string $baseUrl = 'https://panel.wablas.com/api';

    public function __construct()
    {
        $this->token = env('WA_GATEWAY_TOKEN', '');
        $this->deviceToken = env('WA_GATEWAY_DEVICE_TOKEN', '');
    }

    /**
     * Kirim pesan ke grup WhatsApp
     */
    public function sendToGroup(string $message): bool
    {
        if (empty($this->token) || empty($this->deviceToken)) {
            Log::warning('Wablas token/device token tidak dikonfigurasi di .env');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send-message", [
                'phone' => $this->deviceToken,
                'message' => $message,
                'type' => 'group',
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info('Wablas: Pesan grup terkirim', [
                    'device' => $this->deviceToken,
                ]);
                return true;
            }

            Log::warning('Wablas: Gagal mengirim ke grup', [
                'response' => $result,
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Wablas Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim pesan ke nomor individual
     */
    public function sendToIndividual(string $phone, string $message): bool
    {
        if (empty($this->token) || empty($this->deviceToken)) {
            Log::warning('Wablas token/device token tidak dikonfigurasi');
            return false;
        }

        try {
            $formattedPhone = $this->formatPhoneNumber($phone);

            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send-message", [
                'phone' => $formattedPhone,
                'message' => $message,
                'type' => 'personal',
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info('Wablas: Pesan individual terkirim', [
                    'phone' => $formattedPhone,
                ]);
                return true;
            }

            Log::warning('Wablas: Gagal mengirim ke individual', [
                'phone' => $formattedPhone,
                'response' => $result,
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Wablas Individual Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim pesan dengan schedule (jadwal pengiriman)
     */
    public function sendScheduled(string $phone, string $message, string $scheduledAt): bool
    {
        if (empty($this->token) || empty($this->deviceToken)) {
            Log::warning('Wablas token/device token tidak dikonfigurasi');
            return false;
        }

        try {
            $formattedPhone = $this->formatPhoneNumber($phone);

            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send-message-schedule", [
                'phone' => $formattedPhone,
                'message' => $message,
                'schedule' => $scheduledAt, // Format: Y-m-d H:i:s
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info('Wablas: Pesan terjadwal terkirim', [
                    'phone' => $formattedPhone,
                    'scheduled_at' => $scheduledAt,
                ]);
                return true;
            }

            Log::warning('Wablas: Gagal mengirim pesan terjadwal', [
                'response' => $result,
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Wablas Scheduled Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Format nomor HP ke format internasional (62xxx)
     */
    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            return '62' . substr($phone, 1);
        }

        if (str_starts_with($phone, '62')) {
            return $phone;
        }

        if (str_starts_with($phone, '8')) {
            return '62' . $phone;
        }

        if (str_starts_with($phone, '+62')) {
            return substr($phone, 1);
        }

        return $phone;
    }

    /**
     * Format pesan jadwal untuk broadcast ke grup
     */
    public function formatScheduleMessage($schedule): string
    {
        $tanggal = \Carbon\Carbon::parse($schedule->date)->format('d M Y');
        $hari = $schedule->type === 'senin' ? 'Senin' : 'Jumat';

        $message = "📢 *JADWAL APEL PENGADILAN AGAMA PENAJAM*\n\n";
        $message .= "🗓️ *Tanggal:* {$tanggal} ({$hari})\n\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "📋 *PENUGASAN:*\n";

        foreach ($schedule->assignments as $assignment) {
            $role = $assignment->role;
            $name = $assignment->user->name ?? '-';
            $message .= "• {$role}: {$name}\n";
        }

        $message .= "━━━━━━━━━━━━━━━━━━━━\n";
        $message .= "💪 *Tetap semangat dan hadir tepat waktu!*\n\n";
        $message .= "_Generated by APEL System_";

        return $message;
    }

    /**
     * Format pesan individual untuk setiap pegawai
     */
    public function formatIndividualMessage($schedule, $user, $assignment): string
    {
        $tanggal = \Carbon\Carbon::parse($schedule->date)->format('d M Y');
        $hari = $schedule->type === 'senin' ? 'Senin' : 'Jumat';
        $jam = $schedule->type === 'senin' ? '07.30 WITA' : '16.00 WITA';

        $message = "Assalamu'alaikum Wr. Wb.\n\n";
        $message .= "Bapak/Ibu *{$user->name}*,\n\n";
        $message .= "Terima kasih atas partisipasi dalam upacara apel.\n\n";
        $message .= "📅 *JADWAL APEL*\n";
        $message .= "Tanggal: {$tanggal} ({$hari})\n";
        $message .= "Jam: {$jam}\n\n";
        $message .= "📋 *TUGAS YANG DIBERIKAN:*\n";
        $message .= "🔹 {$assignment->role}\n\n";
        $message .= "Mohon hadir tepat waktu.\n\n";
        $message .= "Wassalamu'alaikum Wr. Wb.\n\n";
        $message .= "_APEL System - Pengadilan Agama Penajam_";

        return $message;
    }

    /**
     * Format pesan reminder (pengingat 1 hari sebelum)
     */
    public function formatReminderMessage($schedule, $user, $assignment): string
    {
        $tanggal = \Carbon\Carbon::parse($schedule->date)->format('d M Y');
        $hari = $schedule->type === 'senin' ? 'Senin' : 'Jumat';
        $jam = $schedule->type === 'senin' ? '07.30 WITA' : '16.00 WITA';

        $message = "⏰ *PENGINGAT APEL BESOK*\n\n";
        $message .= "Bapak/Ibu *{$user->name}*,\n\n";
        $message .= "Ini adalah pengingat untuk upacara apel besok.\n\n";
        $message .= "📅 *DETAIL:*\n";
        $message .= "Tanggal: {$tanggal} ({$hari})\n";
        $message .= "Jam: {$jam}\n";
        $message .= "Tugas: *{$assignment->role}*\n\n";
        $message .= "Siapkan diri Anda dan hadir tepat waktu ya!\n\n";
        $message .= "_APEL System - PA Penajam_";

        return $message;
    }

    /**
     * Cek sisa kuota Wablas
     */
    public function checkQuota(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->get("{$this->baseUrl}/info");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'quota' => $data['quota'] ?? 0,
                    'phone' => $data['phone'] ?? '',
                    'status' => $data['status'] ?? '',
                ];
            }

            return [
                'success' => false,
                'message' => 'Gagal mengambil info kuota',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test koneksi ke API Wablas
     */
    public function testConnection(): array
    {
        if (empty($this->token) || empty($this->deviceToken)) {
            return [
                'success' => false,
                'message' => 'Token atau Device Token tidak dikonfigurasi',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->get("{$this->baseUrl}/device");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message' => 'Koneksi berhasil',
                    'device' => $data,
                ];
            }

            return [
                'success' => false,
                'message' => 'Koneksi gagal',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Broadcast ke semua anggota jadwal (individual)
     */
    public function broadcastToAll($schedule): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'no_phone' => 0,
            'details' => [],
        ];

        if (empty($this->token) || empty($this->deviceToken)) {
            $results['message'] = 'Token tidak dikonfigurasi';
            return $results;
        }

        foreach ($schedule->assignments as $assignment) {
            $user = $assignment->user;

            if (!$user || !$user->phone) {
                $results['no_phone']++;
                $results['details'][] = [
                    'name' => $user->name ?? 'Unknown',
                    'status' => 'no_phone',
                ];
                continue;
            }

            $message = $this->formatIndividualMessage($schedule, $user, $assignment);
            $sent = $this->sendToIndividual($user->phone, $message);

            if ($sent) {
                $results['success']++;
                $results['details'][] = [
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'status' => 'success',
                ];
            } else {
                $results['failed']++;
                $results['details'][] = [
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'status' => 'failed',
                ];
            }

            // Delay untuk menghindari rate limit
            usleep(500000); // 0.5 detik
        }

        return $results;
    }
}
