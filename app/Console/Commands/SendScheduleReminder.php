<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Schedule;
use App\Services\FonteeService;
use Carbon\Carbon;

class SendScheduleReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:send-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send H-1 reminder for apology schedules to WhatsApp group';

    /**
     * Execute the console command.
     */
    public function handle(FonteeService $fontee)
    {
        $tomorrow = Carbon::tomorrow()->toDateString();

        $schedules = Schedule::with('assignments.user')
            ->whereDate('date', $tomorrow)
            ->where('notification_sent', false)
            ->get();

        if ($schedules->isEmpty()) {
            $this->info("No schedules found for tomorrow ($tomorrow) or already notified.");
            return;
        }

        $target = env('FONTEE_TARGET_GROUP');
        if (!$target || !env('FONTEE_TOKEN')) {
            $this->error('Fontee configuration missing (Token or Target Group).');
            return;
        }

        foreach ($schedules as $schedule) {
            $message = "*[REMINDER]* Jadwal Apel Besok (" . Carbon::parse($schedule->date)->format('d M Y') . "):\n\n";
            foreach ($schedule->assignments as $assignment) {
                $message .= "- {$assignment->role}: " . ($assignment->user->name ?? '-') . "\n";
            }

            $success = $fontee->sendText($target, $message);

            if ($success) {
                $schedule->update(['notification_sent' => true]);
                $this->info("Reminder sent for schedule ID: {$schedule->id}");
            } else {
                $this->error("Failed to send reminder for schedule ID: {$schedule->id}");
            }
        }
    }
}
