<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;

class SchedulerService
{
    /**
     * Generate schedules for a given date range.
     */
    public function generate(Carbon $startDate, Carbon $endDate)
    {
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            // Check if Monday or Friday
            if ($currentDate->isMonday()) {
                $this->createSchedule($currentDate, 'senin');
            } elseif ($currentDate->isFriday()) {
                $this->createSchedule($currentDate, 'jumat');
            }
            $currentDate->addDay();
        }
    }

    protected function createSchedule(Carbon $date, string $type)
    {
        // Check if schedule exists
        if (Schedule::where('date', $date->format('Y-m-d'))->exists()) {
            return;
        }

        // Calculate scheduled notification time
        // Senin: 07:00 WITA (1 jam sebelum apel jam 08:00)
        // Jumat: 08:00 WITA (8 jam sebelum apel jam 16:00)
        $notificationTime = $type === 'senin'
            ? $date->copy()->setTime(7, 0, 0)  // Senin jam 07:00
            : $date->copy()->setTime(8, 0, 0); // Jumat jam 08:00

        $schedule = Schedule::create([
            'date' => $date->format('Y-m-d'),
            'type' => $type,
            'scheduled_notification_at' => $notificationTime,
            'notification_status' => 'pending',
            'is_auto_notification' => true,
        ]);

        $this->assignRoles($schedule);
    }

    protected function assignRoles(Schedule $schedule)
    {
        // Get assigned user IDs to exclude from other roles
        $assignedIds = [];

        // 1. Pembina Apel: pimpinan (pimpinan)
        $pembina = $this->selectCandidateForRole('Pembina Apel', function ($query) {
            $query->where('jenis_jabatan', 'pimpinan');
        });
        $this->assign($schedule, $pembina, 'Pembina Apel');
        if ($pembina) {
            $assignedIds[] = $pembina->id;
        }

        // 2. Pembaca Doa: Laki-laki PNS + CPAPES
        $doa = $this->selectCandidateForRole('Pembaca Doa', function ($query) use (&$assignedIds) {
            $query->whereIn('jenis_pegawai', ['PNS', 'CPNS'])
                ->where('gender', 'L')
                ->whereNotIn('id', $assignedIds);
        });
        $this->assign($schedule, $doa, 'Pembaca Doa');
        if ($doa) {
            $assignedIds[] = $doa->id;
        }

        // 3. Pembaca 8 Nilai MA: Perempuan PNS Staff
        $nilai8 = $this->selectCandidateForRole('Pembaca 8 Nilai MA', function ($query) use (&$assignedIds) {
            $query->where('jenis_pegawai', 'PNS')
                ->where('jenis_jabatan', 'Staff')
                ->where('gender', 'P')
                ->whereNotIn('id', $assignedIds);
        });
        $this->assign($schedule, $nilai8, 'Pembaca 8 Nilai MA');
        if ($nilai8) {
            $assignedIds[] = $nilai8->id;
        }

        // 4. MC: Perempuan CPAPES/PPPK Staff
        $mc = $this->selectCandidateForRole('MC', function ($query) use (&$assignedIds) {
            $query->whereIn('jenis_pegawai', ['CPNS', 'PPPK'])
                ->where('jenis_jabatan', 'Staff')
                ->where('gender', 'P')
                ->whereNotIn('id', $assignedIds);
        });
        $this->assign($schedule, $mc, 'MC');
        if ($mc) {
            $assignedIds[] = $mc->id;
        }

        // 5. Pemimpin Apel: Laki-laki PPPK
        $pemimpin = $this->selectCandidateForRole('Pemimpin Apel', function ($query) use (&$assignedIds) {
            $query->where('jenis_pegawai', 'PPPK')
                ->where('gender', 'L')
                ->whereNotIn('id', $assignedIds);
        });
        $this->assign($schedule, $pemimpin, 'Pemimpin Apel');
        if ($pemimpin) {
            $assignedIds[] = $pemimpin->id;
        }

        // 6. Pembaca Lainnya: CPAPES Staff (yang belum bertugas)
        $lain = $this->selectCandidateForRole('Pembaca Lainnya', function ($query) use (&$assignedIds) {
            $query->where('jenis_pegawai', 'CPNS')
                ->where('jenis_jabatan', 'Staff')
                ->whereNotIn('id', $assignedIds);
        });
        $this->assign($schedule, $lain, 'Pembaca Lainnya');
        if ($lain) {
            $assignedIds[] = $lain->id;
        }
    }

    /**
     * Get user who was least recently assigned for a specific role
     */
    protected function selectCandidateForRole(string $roleName, callable $filter)
    {
        $query = User::query();
        $filter($query);
        $candidates = $query->get();

        if ($candidates->isEmpty()) {
            return null;
        }

        // Sort by last assigned date for this SPECIFIC role (ascending) for fair rotation
        $candidates = $candidates->sortBy(function ($user) use ($roleName) {
            $lastAssignment = Assignment::where('user_id', $user->id)
                ->where('role', $roleName)
                ->join('schedules', 'assignments.schedule_id', '=', 'schedules.id')
                ->orderBy('schedules.date', 'desc')
                ->first();

            return $lastAssignment ? $lastAssignment->date : '0000-00-00';
        });

        return $candidates->first();
    }

    protected function assign(Schedule $schedule, ?User $user, string $roleName)
    {
        if ($user) {
            Assignment::create([
                'schedule_id' => $schedule->id,
                'user_id' => $user->id,
                'role' => $roleName,
            ]);
            // Refresh relation
            $schedule->load('assignments');
        }
    }
}
