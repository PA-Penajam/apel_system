<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * FonnteService - WhatsApp API Service
 *
 * Configuration in .env:
 * - FONNTE_TOKEN: Your Fonnte API token
 * - FONNTE_TARGET_GROUP: Group ID for broadcast (optional)
 */
class FonnteService
{
    protected string $token;
    protected string $targetGroup;
    protected string $baseUrl = 'https://api.fonnte.com/api';

    public function __construct()
    {
        $this->token = env('FONNTE_TOKEN', '');
        $this->targetGroup = env('FONNTE_TARGET_GROUP', '');
    }

    /**
     * Send message to individual phone number
     */
    public function sendToIndividual(string $phone, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('Fonnte Token tidak dikonfigurasi');
            return false;
        }

        try {
            $formattedPhone = $this->formatPhoneNumber($phone);

            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send", [
                'target' => $formattedPhone,
                'message' => $message,
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info('Fonnte: Pesan individual terkirim', ['phone' => $formattedPhone]);
                return true;
            }

            Log::warning('Fonnte: Gagal mengirim ke individual', ['response' => $result]);
            return false;
        } catch (\Exception $e) {
            Log::error('Fonnte Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send message to WhatsApp group
     */
    public function sendToGroup(string $groupId, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('Fonnte Token tidak dikonfigurasi');
            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send", [
                'target' => $groupId,
                'message' => $message,
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info('Fonnte: Pesan grup terkirim', ['group_id' => $groupId]);
                return true;
            }

            Log::warning('Fonnte: Gagal mengirim ke grup', ['response' => $result]);
            return false;
        } catch (\Exception $e) {
            Log::error('Fonnte Group Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send message to all groups where the number is a member
     */
    public function sendToAllGroups(string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('Fonnte Token tidak dikonfigurasi');
            return false;
        }

        try {
            // Kirim tanpa target spesifik - akan terkirim ke semua grup
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send", [
                'target' => 'allgroup', // Fonnte special keyword
                'message' => $message,
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                Log::info('Fonnte: Pesan terkirim ke semua grup');
                return true;
            }

            Log::warning('Fonnte: Gagal mengirim ke semua grup', ['response' => $result]);
            return false;
        } catch (\Exception $e) {
            Log::error('Fonnte All Groups Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send to specific target (group or individual)
     */
    public function send(string $target, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('Fonnte Token tidak dikonfigurasi');
            return false;
        }

        try {
            $formattedTarget = $this->formatPhoneNumber($target);

            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post("{$this->baseUrl}/send", [
                'target' => $formattedTarget,
                'message' => $message,
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === true) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Fonnte Send Exception: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Format phone number to international format (62xxx)
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

        return $phone;
    }

    /**
     * Test connection to Fonnte API
     */
    public function testConnection(): array
    {
        if (empty($this->token)) {
            return [
                'success' => false,
                'message' => 'Token tidak dikonfigurasi',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->get("{$this->baseUrl}/check");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message' => 'Koneksi berhasil',
                    'device' => $data ?? null,
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
     * Check quota/usage from Fonnte
     */
    public function checkQuota(): array
    {
        if (empty($this->token)) {
            return [
                'success' => false,
                'message' => 'Token tidak dikonfigurasi',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->get("{$this->baseUrl}/quota");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'quota' => [
                        'remaining' => $data['remaining'] ?? 'Unknown',
                        'total' => $data['total'] ?? 'Unknown',
                        'expired' => $data['expired'] ?? 'Unknown',
                    ],
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
     * Check token status
     */
    public function checkTokenStatus(): array
    {
        if (empty($this->token)) {
            return [
                'valid' => false,
                'message' => 'Token tidak dikonfigurasi',
            ];
        }

        return $this->testConnection();
    }

    /**
     * Get target group from config
     */
    public function getTargetGroup(): string
    {
        return $this->targetGroup;
    }

    /**
     * Check if token is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->token);
    }

    /**
     * Check if target group is configured
     */
    public function hasTargetGroup(): bool
    {
        return !empty($this->targetGroup);
    }
}
