<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\DeferredAssignment;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SchedulerService
{
    /**
     * Generate schedules for a given date range.
     *
     * Dates are grouped by ISO week. A single team of six officers is selected
     * once per week and assigned to both Monday and Friday of that week.
     */
    public function generate(Carbon $startDate, Carbon $endDate): void
    {
        $currentDate = $startDate->copy();

        // Group dates by ISO week (Senin as start of week)
        $weeks = [];
        while ($currentDate <= $endDate) {
            $weekStart = $currentDate->copy()->startOfWeek()->format('Y-m-d');
            if (! isset($weeks[$weekStart])) {
                $weeks[$weekStart] = [];
            }
            $weeks[$weekStart][] = $currentDate->copy();
            $currentDate->addDay();
        }

        foreach ($weeks as $weekStartDate => $dates) {
            $seninDate = collect($dates)->firstWhere(fn ($d) => $d->isMonday());
            $jumatDate = collect($dates)->firstWhere(fn ($d) => $d->isFriday());

            $types = [];
            if ($seninDate) {
                $types[] = 'senin';
            }
            if ($jumatDate) {
                $types[] = 'jumat';
            }

            if ($types === []) {
                continue;
            }

            $officers = $this->selectOfficersForWeek($weekStartDate, $types);

            if ($seninDate) {
                $this->createScheduleWithOfficers($seninDate, 'senin', $officers);
            }

            if ($jumatDate) {
                $this->createScheduleWithOfficers($jumatDate, 'jumat', $officers);
            }
        }

        $this->replaceInactiveOfficersInExistingSchedules($startDate, $endDate);
    }

    /**
     * Select six unique officers for the week based on fair rotation.
     *
     * @param  list<string>  $scheduleTypes
     * @return list<array{user_id: int, role: string, deferred_id: int|null}>
     */
    protected function selectOfficersForWeek(string $weekStartDate, array $scheduleTypes): array
    {
        $officers = [];
        $roles = RoleEligibilityService::roles();

        foreach ($roles as $roleName) {
            $selected = $this->selectCandidateForRole($roleName, $officers, $weekStartDate, $scheduleTypes);

            if ($selected) {
                $officers[] = [
                    'user_id' => $selected->id,
                    'role' => $roleName,
                    'deferred_id' => null,
                ];
            }
        }

        return $officers;
    }

    /**
     * Select a candidate for a role using primary and fallback criteria.
     *
     * Pending deferred assignments are evaluated first so officers who missed a
     * previous duty are prioritized for the next occurrence.
     *
     * @param  array<int, array{user_id: int, role: string, deferred_id: int|null}>  $alreadySelected
     * @param  list<string>  $scheduleTypes
     */
    protected function selectCandidateForRole(string $roleName, array $alreadySelected, string $weekStartDate, array $scheduleTypes): ?User
    {
        $selectedIds = array_column($alreadySelected, 'user_id');

        // 1. Try to fulfill pending deferred assignments first.
        $deferred = DeferredAssignment::pending()
            ->where('role', $roleName)
            ->whereIn('schedule_type', $scheduleTypes)
            ->whereNotIn('user_id', $selectedIds)
            ->whereHas('user', fn ($query) => $query->where('is_active', true))
            ->orderBy('created_at')
            ->first();

        if ($deferred && RoleEligibilityService::isEligible($deferred->user, $roleName)) {
            return $deferred->user;
        }

        // 2. Fall back to fair rotation through primary and fallback criteria.
        $criteria = RoleEligibilityService::criteriaForRole($roleName);

        foreach ($criteria as $criterion) {
            $query = User::where('is_active', true)
                ->whereNotIn('id', $selectedIds);

            if (isset($criterion['jenis_jabatan'])) {
                $allowed = is_array($criterion['jenis_jabatan'])
                    ? $criterion['jenis_jabatan']
                    : [$criterion['jenis_jabatan']];
                $query->whereIn(DB::raw('LOWER(jenis_jabatan)'), array_map('strtolower', $allowed));
            }

            if (isset($criterion['gender'])) {
                $query->where('gender', $criterion['gender']);
            }

            $candidates = $query->get();

            if ($candidates->isNotEmpty()) {
                return $this->pickFairRotationCandidate($candidates, $roleName);
            }
        }

        return null;
    }

    /**
     * Pick the candidate least recently assigned to the given role.
     *
     * @param  Collection<int, User>  $candidates
     */
    protected function pickFairRotationCandidate($candidates, string $roleName): User
    {
        $sorted = $candidates->sortBy(function (User $user) use ($roleName) {
            $lastAssignment = Assignment::where('assignments.user_id', $user->id)
                ->where('assignments.role', $roleName)
                ->join('schedules', 'assignments.schedule_id', '=', 'schedules.id')
                ->orderBy('schedules.date', 'desc')
                ->first();

            return $lastAssignment ? $lastAssignment->date : '0000-00-00';
        });

        return $sorted->first();
    }

    /**
     * Create a schedule with pre-selected officers.
     *
     * @param  list<array{user_id: int, role: string, deferred_id: int|null}>  $officers
     */
    protected function createScheduleWithOfficers(Carbon $date, string $type, array $officers): void
    {
        $schedule = $this->findOrCreateSchedule($date, $type);

        foreach ($officers as $officer) {
            if ($schedule->assignments()->where('role', $officer['role'])->exists()) {
                continue;
            }

            $schedule->assignments()->create([
                'user_id' => $officer['user_id'],
                'role' => $officer['role'],
            ]);

            $this->fulfillDeferredAssignment($officer['user_id'], $officer['role'], $type, $schedule);
        }
    }

    /**
     * Create a schedule (fallback for single day without matching pair).
     */
    protected function createSchedule(Carbon $date, string $type): void
    {
        $schedule = $this->findOrCreateSchedule($date, $type);
        $this->fillEmptyRoles($schedule);
    }

    /**
     * Find an existing schedule or create a new one.
     */
    protected function findOrCreateSchedule(Carbon $date, string $type): Schedule
    {
        $schedule = Schedule::where('date', $date->format('Y-m-d'))->first();

        if ($schedule) {
            return $schedule;
        }

        $notificationTime = $type === 'senin'
            ? $date->copy()->setTime(7, 0, 0)
            : $date->copy()->setTime(8, 0, 0);

        return Schedule::create([
            'date' => $date->format('Y-m-d'),
            'type' => $type,
            'scheduled_notification_at' => $notificationTime,
            'notification_status' => 'pending',
            'is_auto_notification' => true,
        ]);
    }

    /**
     * Fill any missing roles for an existing schedule.
     */
    protected function fillEmptyRoles(Schedule $schedule): void
    {
        $roles = RoleEligibilityService::roles();

        foreach ($roles as $roleName) {
            if ($schedule->assignments()->where('role', $roleName)->exists()) {
                continue;
            }

            $currentOfficers = $schedule->assignments()
                ->get()
                ->map(fn (Assignment $a) => ['user_id' => $a->user_id, 'role' => $a->role, 'deferred_id' => null])
                ->all();

            $candidate = $this->selectCandidateForRole(
                $roleName,
                $currentOfficers,
                Carbon::parse($schedule->date)->startOfWeek()->format('Y-m-d'),
                [$schedule->type]
            );

            if ($candidate) {
                $schedule->assignments()->create([
                    'user_id' => $candidate->id,
                    'role' => $roleName,
                ]);

                $this->fulfillDeferredAssignment($candidate->id, $roleName, $schedule->type, $schedule);
            }
        }
    }

    /**
     * Mark any pending deferred assignment for this user/role/type as fulfilled.
     */
    protected function fulfillDeferredAssignment(int $userId, string $roleName, string $type, Schedule $schedule): void
    {
        $deferred = DeferredAssignment::pending()
            ->where('user_id', $userId)
            ->where('role', $roleName)
            ->where('schedule_type', $type)
            ->first();

        if ($deferred) {
            $deferred->update([
                'status' => 'fulfilled',
                'fulfilled_schedule_id' => $schedule->id,
                'fulfilled_at' => now(),
            ]);
        }
    }

    /**
     * Replace inactive officers or officers whose criteria no longer match in
     * existing pending schedules within the generated date range.
     */
    protected function replaceInactiveOfficersInExistingSchedules(Carbon $startDate, Carbon $endDate): void
    {
        $pendingSchedules = Schedule::whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('notification_status', 'pending')
            ->with('assignments.user')
            ->get();

        foreach ($pendingSchedules as $schedule) {
            foreach ($schedule->assignments as $assignment) {
                $user = $assignment->user;

                if (! $user || ! $user->is_active || ! RoleEligibilityService::isEligible($user, $assignment->role)) {
                    $this->replaceAssignment($schedule, $assignment);
                }
            }
        }
    }

    /**
     * Replace a single assignment while preserving role uniqueness.
     */
    protected function replaceAssignment(Schedule $schedule, Assignment $assignment): void
    {
        $currentOfficers = $schedule->assignments()
            ->where('id', '!=', $assignment->id)
            ->get()
            ->map(fn (Assignment $a) => ['user_id' => $a->user_id, 'role' => $a->role, 'deferred_id' => null])
            ->all();

        $replacement = $this->selectCandidateForRole(
            $assignment->role,
            $currentOfficers,
            Carbon::parse($schedule->date)->startOfWeek()->format('Y-m-d'),
            [$schedule->type]
        );

        if ($replacement) {
            $assignment->update(['user_id' => $replacement->id]);
        }
    }
}
