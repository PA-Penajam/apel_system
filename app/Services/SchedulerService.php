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

        // Group dates by week (Senin as start of week)
        $weeks = [];
        while ($currentDate <= $endDate) {
            $weekStart = Carbon::parse($currentDate)->startOfWeek()->format('Y-m-d');
            if (! isset($weeks[$weekStart])) {
                $weeks[$weekStart] = [];
            }
            $weeks[$weekStart][] = $currentDate->copy();
            $currentDate->addDay();
        }

        // For each week, determine the 6 officers first
        foreach ($weeks as $weekStartDate => $dates) {
            $seninDate = collect($dates)->firstWhere(fn ($d) => $d->isMonday());
            $jumatDate = collect($dates)->firstWhere(fn ($d) => $d->isFriday());

            if ($seninDate && $jumatDate) {
                // Select 6 officers for this week
                $officers = $this->selectOfficersForWeek($weekStartDate);

                // Create Senin schedule
                $this->createScheduleWithOfficers($seninDate, 'senin', $officers);

                // Create Jumat schedule with SAME officers
                $this->createScheduleWithOfficers($jumatDate, 'jumat', $officers);
            } elseif ($seninDate) {
                $this->createSchedule($seninDate, 'senin');
            } elseif ($jumatDate) {
                $this->createSchedule($jumatDate, 'jumat');
            }
        }
    }

    /**
     * Select 6 unique officers for the week based on fair rotation.
     */
    protected function selectOfficersForWeek(string $weekStartDate): array
    {
        // Get officers already used in previous weeks (for all roles)
        $usedOfficers = Assignment::whereHas('schedule', function ($query) use ($weekStartDate) {
            $query->where('date', '<', $weekStartDate);
        })->pluck('user_id')->unique()->toArray();

        // Get candidates for each role
        $roles = [
            'Pembina Apel' => function ($query) {
                $query->where('jenis_jabatan', 'pimpinan');
            },
            'Pembaca Doa' => function ($query) {
                $query->whereIn('jenis_pegawai', ['PNS', 'CPNS'])->where('gender', 'L');
            },
            'Pembaca 8 Nilai MA' => function ($query) {
                $query->where('jenis_pegawai', 'PNS')->where('jenis_jabatan', '!=', 'pimpinan')->where('gender', 'P');
            },
            'MC' => function ($query) {
                $query->whereIn('jenis_pegawai', ['CPNS', 'PPPK'])->where('jenis_jabatan', 'Staff')->where('gender', 'P');
            },
            'Pemimpin Apel' => function ($query) {
                $query->where('jenis_pegawai', 'PPPK')->where('gender', 'L');
            },
            'Pembaca Lainnya' => function ($query) {
                $query->whereIn('jenis_pegawai', ['PNS', 'CPNS'])->where('jenis_jabatan', 'Staff');
            },
        ];

        $officers = [];
        foreach ($roles as $roleName => $filter) {
            // Build query with exclusions first
            $query = User::whereNotIn('id', $usedOfficers)
                ->whereNotIn('id', array_column($officers, 'user_id'));

            // Apply role-specific filter to query builder
            $filter($query);

            $candidates = $query->get();

            if ($candidates->isEmpty()) {
                // Fallback: use candidates without excluding used officers
                $query2 = User::whereNotIn('id', array_column($officers, 'user_id'));
                $filter($query2);
                $candidates = $query2->get();
            }

            // Sort by last assignment date for this role
            $candidates = $candidates->sortBy(function ($user) use ($roleName) {
                $lastAssignment = Assignment::where('user_id', $user->id)
                    ->where('role', $roleName)
                    ->join('schedules', 'assignments.schedule_id', '=', 'schedules.id')
                    ->orderBy('schedules.date', 'desc')
                    ->first();

                return $lastAssignment ? $lastAssignment->date : '0000-00-00';
            });

            $selected = $candidates->first();
            if ($selected) {
                $officers[] = [
                    'user_id' => $selected->id,
                    'role' => $roleName,
                ];
            }
        }

        return $officers;
    }

    /**
     * Create a schedule with pre-selected officers.
     */
    protected function createScheduleWithOfficers(Carbon $date, string $type, array $officers)
    {
        // Check if schedule exists
        if (Schedule::where('date', $date->format('Y-m-d'))->exists()) {
            return;
        }

        // Calculate scheduled notification time
        $notificationTime = $type === 'senin'
            ? $date->copy()->setTime(7, 0, 0)
            : $date->copy()->setTime(8, 0, 0);

        $schedule = Schedule::create([
            'date' => $date->format('Y-m-d'),
            'type' => $type,
            'scheduled_notification_at' => $notificationTime,
            'notification_status' => 'pending',
            'is_auto_notification' => true,
        ]);

        // Assign the same officers
        foreach ($officers as $officer) {
            Assignment::create([
                'schedule_id' => $schedule->id,
                'user_id' => $officer['user_id'],
                'role' => $officer['role'],
            ]);
        }
    }

    /**
     * Create schedule (fallback for single day).
     */
    protected function createSchedule(Carbon $date, string $type)
    {
        // Check if schedule exists
        if (Schedule::where('date', $date->format('Y-m-d'))->exists()) {
            return;
        }

        $notificationTime = $type === 'senin'
            ? $date->copy()->setTime(7, 0, 0)
            : $date->copy()->setTime(8, 0, 0);

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
        // Get week boundaries (Senin - Minggu)
        $startOfWeek = Carbon::parse($schedule->date)->startOfWeek();
        $endOfWeek = Carbon::parse($schedule->date)->endOfWeek();

        // Get all user IDs who already have assignments in THIS week
        // (user who worked earlier in the same week should not work again)
        $assignedThisWeek = Assignment::whereHas('schedule', function ($query) use ($startOfWeek, $endOfWeek, $schedule) {
            $query->whereBetween('date', [$startOfWeek, $endOfWeek])
                ->where('id', '!=', $schedule->id); // Exclude current schedule
        })->pluck('user_id')->unique()->toArray();

        // Get assigned user IDs to exclude from other roles in SAME schedule
        $assignedIds = [];

        // 1. Pembina Apel: pimpinan (pimpinan)
        $pembina = $this->selectCandidateForRole('Pembina Apel', function ($query) use (&$assignedIds, &$assignedThisWeek) {
            $query->where('jenis_jabatan', 'pimpinan')
                ->whereNotIn('id', $assignedIds)
                ->whereNotIn('id', $assignedThisWeek);
        });
        $this->assign($schedule, $pembina, 'Pembina Apel');
        if ($pembina) {
            $assignedIds[] = $pembina->id;
        }

        // 2. Pembaca Doa: Laki-laki PNS + CPAPES
        $doa = $this->selectCandidateForRole('Pembaca Doa', function ($query) use (&$assignedIds, &$assignedThisWeek) {
            $query->whereIn('jenis_pegawai', ['PNS', 'CPNS'])
                ->where('gender', 'L')
                ->whereNotIn('id', $assignedIds)
                ->whereNotIn('id', $assignedThisWeek);
        });
        $this->assign($schedule, $doa, 'Pembaca Doa');
        if ($doa) {
            $assignedIds[] = $doa->id;
        }

        // 3. Pembaca 8 Nilai MA: Perempuan PNS Staff
        $nilai8 = $this->selectCandidateForRole('Pembaca 8 Nilai MA', function ($query) use (&$assignedIds, &$assignedThisWeek) {
            $query->where('jenis_pegawai', 'PNS')
                ->where('jenis_jabatan', 'Staff')
                ->where('gender', 'P')
                ->whereNotIn('id', $assignedIds)
                ->whereNotIn('id', $assignedThisWeek);
        });
        $this->assign($schedule, $nilai8, 'Pembaca 8 Nilai MA');
        if ($nilai8) {
            $assignedIds[] = $nilai8->id;
        }

        // 4. MC: Perempuan CPAPES/PPPK Staff
        $mc = $this->selectCandidateForRole('MC', function ($query) use (&$assignedIds, &$assignedThisWeek) {
            $query->whereIn('jenis_pegawai', ['CPNS', 'PPPK'])
                ->where('jenis_jabatan', 'Staff')
                ->where('gender', 'P')
                ->whereNotIn('id', $assignedIds)
                ->whereNotIn('id', $assignedThisWeek);
        });
        $this->assign($schedule, $mc, 'MC');
        if ($mc) {
            $assignedIds[] = $mc->id;
        }

        // 5. Pemimpin Apel: Laki-laki PPPK
        $pemimpin = $this->selectCandidateForRole('Pemimpin Apel', function ($query) use (&$assignedIds, &$assignedThisWeek) {
            $query->where('jenis_pegawai', 'PPPK')
                ->where('gender', 'L')
                ->whereNotIn('id', $assignedIds)
                ->whereNotIn('id', $assignedThisWeek);
        });
        $this->assign($schedule, $pemimpin, 'Pemimpin Apel');
        if ($pemimpin) {
            $assignedIds[] = $pemimpin->id;
        }

        // 6. Pembaca Lainnya: CPAPES Staff (yang belum bertugas di minggu ini)
        $lain = $this->selectCandidateForRole('Pembaca Lainnya', function ($query) use (&$assignedIds, &$assignedThisWeek) {
            $query->where('jenis_pegawai', 'CPNS')
                ->where('jenis_jabatan', 'Staff')
                ->whereNotIn('id', $assignedIds)
                ->whereNotIn('id', $assignedThisWeek);
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
