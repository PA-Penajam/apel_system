<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkAbsentRequest;
use App\Models\Assignment;
use App\Models\DeferredAssignment;
use App\Models\Schedule;
use App\Models\User;
use App\Services\RoleEligibilityService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleAbsenceController extends Controller
{
    /**
     * Show absence options for a given assignment.
     */
    public function preview(Assignment $assignment): JsonResponse
    {
        $schedule = $assignment->schedule;
        $eligibleUsers = User::where('is_active', true)
            ->where('id', '!=', $assignment->user_id)
            ->where(function ($query) use ($assignment) {
                $criteria = RoleEligibilityService::criteriaForRole($assignment->role);
                foreach ($criteria as $criterion) {
                    $query->orWhere(function ($q) use ($criterion) {
                        if (isset($criterion['jenis_jabatan'])) {
                            $allowed = is_array($criterion['jenis_jabatan'])
                                ? $criterion['jenis_jabatan']
                                : [$criterion['jenis_jabatan']];
                            $q->whereIn('jenis_jabatan', $allowed);
                        }
                        if (isset($criterion['gender'])) {
                            $q->where('gender', $criterion['gender']);
                        }
                    });
                }
            })
            ->orderBy('name')
            ->get(['id', 'name', 'jenis_jabatan', 'gender']);

        $nextSchedule = $this->findNextMatchingSchedule($assignment);

        return response()->json([
            'assignment' => [
                'id' => $assignment->id,
                'role' => $assignment->role,
                'user_name' => $assignment->user?->name,
            ],
            'schedule' => [
                'id' => $schedule->id,
                'date' => $schedule->date,
                'type' => $schedule->type,
                'formatted_date' => Carbon::parse($schedule->date)->locale('id')->isoFormat('dddd, D MMMM Y'),
            ],
            'next_schedule' => $nextSchedule ? [
                'id' => $nextSchedule->id,
                'date' => $nextSchedule->date,
                'type' => $nextSchedule->type,
                'current_user' => $nextSchedule->assignments()
                    ->where('role', $assignment->role)
                    ->first()?->user?->name,
                'formatted_date' => Carbon::parse($nextSchedule->date)->locale('id')->isoFormat('dddd, D MMMM Y'),
            ] : null,
            'eligible_users' => $eligibleUsers,
        ]);
    }

    /**
     * Mark an officer absent and perform a same-type swap or deferred assignment.
     */
    public function store(MarkAbsentRequest $request, Assignment $assignment): RedirectResponse|JsonResponse
    {
        $schedule = $assignment->schedule;
        $replacedUser = $assignment->user;
        $role = $assignment->role;
        $replacementUserId = $request->input('replacement_user_id');

        if (! $replacedUser) {
            return $this->errorResponse('Petugas tidak ditemukan pada penugasan ini.');
        }

        if (! RoleEligibilityService::isEligible($replacedUser, $role)) {
            return $this->errorResponse('Petugas saat ini tidak memenuhi kriteria role.');
        }

        $nextSchedule = $this->findNextMatchingSchedule($assignment);

        if ($nextSchedule) {
            $nextAssignment = $this->assignmentForRole($nextSchedule, $assignment->role);
            if (! $nextAssignment || ! $nextAssignment->user) {
                return $this->performManualReplacement($assignment, $replacementUserId);
            }

            return $this->performSwap($assignment, $nextSchedule, $replacementUserId);
        }

        return $this->performManualReplacement($assignment, $replacementUserId);
    }

    /**
     * Find the next pending schedule with the same type and an assignment for the role.
     */
    protected function findNextMatchingSchedule(Assignment $assignment): ?Schedule
    {
        $schedule = $assignment->schedule;

        $nextSchedule = Schedule::where('date', '>', $schedule->date)
            ->where('type', $schedule->type)
            ->where('notification_status', 'pending')
            ->whereHas('assignments', function ($query) use ($assignment) {
                $query->where('role', $assignment->role);
            })
            ->orderBy('date')
            ->first();

        if ($nextSchedule && $this->assignmentForRole($nextSchedule, $assignment->role)) {
            return $nextSchedule;
        }

        return null;
    }

    /**
     * Swap the assigned users between current and next schedule for the role.
     */
    protected function performSwap(Assignment $currentAssignment, Schedule $nextSchedule, ?int $replacementUserId): RedirectResponse|JsonResponse
    {
        $currentUser = $currentAssignment->user;
        $role = $currentAssignment->role;

        $nextAssignment = $this->assignmentForRole($nextSchedule, $role);

        if (! $nextAssignment || ! $nextAssignment->user) {
            return $this->performManualReplacement($currentAssignment, $replacementUserId);
        }

        $nextUser = $nextAssignment->user;

        // If a manual replacement is provided, use it instead of swapping.
        if ($replacementUserId) {
            $replacementUser = User::find($replacementUserId);
            if (! $replacementUser || ! RoleEligibilityService::isEligible($replacementUser, $role)) {
                return $this->errorResponse('Pengganti yang dipilih tidak eligible untuk role ini.');
            }

            return DB::transaction(function () use ($currentAssignment, $replacementUser, $currentUser, $role, $nextSchedule) {
                $currentAssignment->update(['user_id' => $replacementUser->id]);

                DeferredAssignment::create([
                    'user_id' => $currentUser->id,
                    'role' => $role,
                    'schedule_type' => $currentAssignment->schedule->type,
                    'source_assignment_id' => $currentAssignment->id,
                    'reason' => 'Berhalangan hadir, pengganti dipilih manual',
                    'status' => 'pending',
                ]);

                $currentAssignment->schedule->update(['notification_status' => 'pending']);

                Log::info('Manual replacement due to absence with deferred assignment', [
                    'current_assignment_id' => $currentAssignment->id,
                    'next_schedule_id' => $nextSchedule->id,
                    'replaced_user_id' => $currentUser->id,
                    'replacement_user_id' => $replacementUser->id,
                    'role' => $role,
                ]);

                return redirect()->back()->with('success', "{$currentUser->name} ditandai berhalangan. Pengganti {$replacementUser->name} dipasang. Giliran {$currentUser->name} diprioritaskan pada jadwal {$currentAssignment->schedule->type} berikutnya.");
            });
        }

        return DB::transaction(function () use ($currentAssignment, $nextAssignment, $currentUser, $nextUser, $role) {
            $currentAssignment->update(['user_id' => $nextUser->id]);
            $nextAssignment->update(['user_id' => $currentUser->id]);

            $currentAssignment->schedule->update(['notification_status' => 'pending']);
            $nextAssignment->schedule->update(['notification_status' => 'pending']);

            Log::info('Officers swapped due to absence', [
                'current_assignment_id' => $currentAssignment->id,
                'next_assignment_id' => $nextAssignment->id,
                'current_user_id' => $currentUser->id,
                'next_user_id' => $nextUser->id,
                'role' => $role,
            ]);

            return redirect()->back()->with('success', "{$currentUser->name} ditukar dengan {$nextUser->name} untuk role {$role}. Jadwal {$currentAssignment->schedule->date} dan {$nextAssignment->schedule->date} diperbarui.");
        });
    }

    /**
     * Perform manual replacement when no future schedule exists.
     */
    protected function performManualReplacement(Assignment $currentAssignment, ?int $replacementUserId): RedirectResponse|JsonResponse
    {
        $currentUser = $currentAssignment->user;
        $role = $currentAssignment->role;

        if (! $replacementUserId) {
            return $this->errorResponse('Pengganti manual wajib dipilih karena belum ada jadwal sejenis berikutnya.');
        }

        $replacementUser = User::find($replacementUserId);
        if (! $replacementUser || ! RoleEligibilityService::isEligible($replacementUser, $role)) {
            return $this->errorResponse('Pengganti yang dipilih tidak eligible untuk role ini.');
        }

        return DB::transaction(function () use ($currentAssignment, $replacementUser, $currentUser, $role) {
            $currentAssignment->update(['user_id' => $replacementUser->id]);
            $currentAssignment->schedule->update(['notification_status' => 'pending']);

            DeferredAssignment::create([
                'user_id' => $currentUser->id,
                'role' => $role,
                'schedule_type' => $currentAssignment->schedule->type,
                'source_assignment_id' => $currentAssignment->id,
                'reason' => 'Berhalangan hadir, pengganti manual karena belum ada jadwal berikutnya',
                'status' => 'pending',
            ]);

            Log::info('Manual replacement due to absence with no future schedule', [
                'current_assignment_id' => $currentAssignment->id,
                'replaced_user_id' => $currentUser->id,
                'replacement_user_id' => $replacementUser->id,
                'role' => $role,
            ]);

            return redirect()->back()->with('success', "{$currentUser->name} ditandai berhalangan. Pengganti {$replacementUser->name} dipasang. Giliran {$currentUser->name} akan diprioritaskan saat jadwal {$currentAssignment->schedule->type} berikutnya dibuat.");
        });
    }

    /**
     * Get the assignment for a role on a schedule.
     */
    protected function assignmentForRole(Schedule $schedule, string $role): ?Assignment
    {
        return $schedule->assignments()->where('role', $role)->first();
    }

    /**
     * Return a redirect back with error message.
     */
    protected function errorResponse(string $message): RedirectResponse
    {
        return redirect()->back()->with('error', $message);
    }
}
