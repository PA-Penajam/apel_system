<?php

namespace App\Console\Commands;

use App\Models\Schedule;
use App\Services\FonnteService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SendScheduledNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send scheduled WhatsApp notifications for upcoming apel schedules';

    public function __construct(public FonnteService $fonnteService)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();

        // Query schedules where notification_status = 'pending' AND scheduled_notification_at <= NOW
        $schedules = Schedule::with('assignments.user')
            ->where('notification_status', 'pending')
            ->where('scheduled_notification_at', '<=', $now)
            ->get();

        if ($schedules->isEmpty()) {
            $this->info("No pending scheduled notifications at {$now->format('Y-m-d H:i:s')}");

            return Command::SUCCESS;
        }

        $token = $this->fonnteService->isConfigured();
        $targetGroup = $this->fonnteService->getTargetGroup();

        if (! $token || ! $targetGroup) {
            $this->error('Fonnte Token atau Target Group tidak dikonfigurasi di .env');

            Log::warning('SendScheduledNotifications: Fonnte configuration missing', [
                'token_configured' => $token,
                'target_group' => $targetGroup ?: 'not set',
            ]);

            return Command::FAILURE;
        }

        // Group by date (senin/jumat)
        $groupedSchedules = $schedules->groupBy('type');

        $successCount = 0;
        $failCount = 0;

        foreach ($groupedSchedules as $type => $typeSchedules) {
            foreach ($typeSchedules as $schedule) {
                $result = $this->sendNotificationForSchedule($schedule);

                if ($result) {
                    $successCount++;
                } else {
                    $failCount++;
                }
            }
        }

        $this->info("Completed: {$successCount} sent, {$failCount} failed");

        Log::info('SendScheduledNotifications: Batch completed', [
            'total_processed' => $schedules->count(),
            'success_count' => $successCount,
            'fail_count' => $failCount,
            'timestamp' => $now->toDateTimeString(),
        ]);

        return $failCount > 0 ? Command::FAILURE : Command::SUCCESS;
    }

    /**
     * Send notification for a single schedule.
     */
    protected function sendNotificationForSchedule(Schedule $schedule): bool
    {
        $message = $this->formatMessage($schedule);

        return DB::transaction(function () use ($schedule, $message) {
            $success = $this->fonnteService->sendToGroup(
                $this->fonnteService->getTargetGroup(),
                $message
            );

            if ($success) {
                $schedule->update([
                    'notification_status' => 'sent',
                    'notification_sent_at' => now(),
                ]);

                $this->info("✓ Sent: {$schedule->date} ({$schedule->type})");

                Log::info('SendScheduledNotifications: Sent', [
                    'schedule_id' => $schedule->id,
                    'date' => $schedule->date,
                    'type' => $schedule->type,
                ]);
            } else {
                // No retry - user will check manually (WA unofficial via Fonnte)
                $schedule->update([
                    'notification_status' => 'failed',
                ]);

                $this->warn("✗ Failed: {$schedule->date} ({$schedule->type}) - cek manual");

                Log::warning('SendScheduledNotifications: Failed (no retry)', [
                    'schedule_id' => $schedule->id,
                    'date' => $schedule->date,
                    'type' => $schedule->type,
                ]);
            }

            return $success;
        });
    }

    /**
     * Format message for WhatsApp group using FonnteService format.
     */
    protected function formatMessage(Schedule $schedule): string
    {
        $tanggal = Carbon::parse($schedule->date)->format('d M Y');
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
        $message .= '_Generated by APEL System_';

        return $message;
    }
}
