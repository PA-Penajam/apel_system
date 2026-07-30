<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\DeferredAssignment;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleAbsenceTest extends TestCase
{
    use RefreshDatabase;

    private function eligibleReplacement(string $role): User
    {
        return match ($role) {
            'Pembina Apel' => User::factory()->create([
                'jenis_jabatan' => 'pimpinan',
                'gender' => 'L',
                'is_active' => true,
            ]),
            'Pembaca Doa', 'Pemimpin Apel' => User::factory()->create([
                'jenis_jabatan' => 'Staff',
                'gender' => 'L',
                'is_active' => true,
            ]),
            'Pembaca 8 Nilai MA', 'MC', 'Pembaca Lainnya' => User::factory()->create([
                'jenis_jabatan' => 'Staff',
                'gender' => 'P',
                'is_active' => true,
            ]),
        };
    }

    public function test_monday_absence_swaps_with_next_monday_same_role(): void
    {
        $admin = User::factory()->create();
        $userA = $this->eligibleReplacement('Pembaca Doa');
        $userB = $this->eligibleReplacement('Pembaca Doa');

        $monday1 = Schedule::create([
            'date' => '2026-08-03',
            'type' => 'senin',
            'notification_status' => 'pending',
        ]);

        $monday2 = Schedule::create([
            'date' => '2026-08-10',
            'type' => 'senin',
            'notification_status' => 'pending',
        ]);

        $assignment1 = Assignment::create([
            'schedule_id' => $monday1->id,
            'user_id' => $userA->id,
            'role' => 'Pembaca Doa',
        ]);

        Assignment::create([
            'schedule_id' => $monday2->id,
            'user_id' => $userB->id,
            'role' => 'Pembaca Doa',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('assignments.absent.store', $assignment1));

        $this->assertDatabaseHas('assignments', [
            'id' => $assignment1->id,
            'user_id' => $userB->id,
        ]);

        $this->assertDatabaseHas('assignments', [
            'schedule_id' => $monday2->id,
            'user_id' => $userA->id,
        ]);

        $this->assertSame('pending', $monday1->refresh()->notification_status);
        $this->assertSame('pending', $monday2->refresh()->notification_status);
    }

    public function test_friday_absence_swaps_with_next_friday_not_monday(): void
    {
        $admin = User::factory()->create();
        $userA = $this->eligibleReplacement('Pembaca Doa');
        $userB = $this->eligibleReplacement('Pembaca Doa');

        $friday1 = Schedule::create([
            'date' => '2026-08-07',
            'type' => 'jumat',
            'notification_status' => 'pending',
        ]);

        $mondayNext = Schedule::create([
            'date' => '2026-08-10',
            'type' => 'senin',
            'notification_status' => 'pending',
        ]);

        $friday2 = Schedule::create([
            'date' => '2026-08-14',
            'type' => 'jumat',
            'notification_status' => 'pending',
        ]);

        $assignmentFriday1 = Assignment::create([
            'schedule_id' => $friday1->id,
            'user_id' => $userA->id,
            'role' => 'Pembaca Doa',
        ]);

        Assignment::create([
            'schedule_id' => $mondayNext->id,
            'user_id' => User::factory()->create()->id,
            'role' => 'Pembaca Doa',
        ]);

        Assignment::create([
            'schedule_id' => $friday2->id,
            'user_id' => $userB->id,
            'role' => 'Pembaca Doa',
        ]);

        $this
            ->actingAs($admin)
            ->post(route('assignments.absent.store', $assignmentFriday1));

        $this->assertDatabaseHas('assignments', [
            'id' => $assignmentFriday1->id,
            'user_id' => $userB->id,
        ]);

        $this->assertDatabaseHas('assignments', [
            'schedule_id' => $friday2->id,
            'user_id' => $userA->id,
        ]);
    }

    public function test_absence_without_future_schedule_requires_manual_replacement(): void
    {
        $admin = User::factory()->create();
        $absentUser = $this->eligibleReplacement('Pembaca Doa');
        $replacement = $this->eligibleReplacement('Pembaca Doa');

        $schedule = Schedule::create([
            'date' => '2026-08-03',
            'type' => 'senin',
            'notification_status' => 'pending',
        ]);

        $assignment = Assignment::create([
            'schedule_id' => $schedule->id,
            'user_id' => $absentUser->id,
            'role' => 'Pembaca Doa',
        ]);

        $response = $this
            ->actingAs($admin)
            ->post(route('assignments.absent.store', $assignment));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this
            ->actingAs($admin)
            ->post(route('assignments.absent.store', $assignment), [
                'replacement_user_id' => $replacement->id,
            ]);

        $this->assertDatabaseHas('assignments', [
            'id' => $assignment->id,
            'user_id' => $replacement->id,
        ]);

        $this->assertDatabaseHas('deferred_assignments', [
            'user_id' => $absentUser->id,
            'role' => 'Pembaca Doa',
            'schedule_type' => 'senin',
            'status' => 'pending',
        ]);
    }

    public function test_invalid_replacement_is_rejected(): void
    {
        $admin = User::factory()->create();
        $absentUser = $this->eligibleReplacement('Pembaca Doa');
        $invalidReplacement = User::factory()->create([
            'jenis_jabatan' => 'pimpinan',
            'gender' => 'L',
            'is_active' => true,
        ]);

        $schedule = Schedule::create([
            'date' => '2026-08-03',
            'type' => 'senin',
            'notification_status' => 'pending',
        ]);

        $assignment = Assignment::create([
            'schedule_id' => $schedule->id,
            'user_id' => $absentUser->id,
            'role' => 'Pembaca Doa',
        ]);

        $response = $this
            ->actingAs($admin)
            ->from(route('schedules.index'))
            ->post(route('assignments.absent.store', $assignment), [
                'replacement_user_id' => $invalidReplacement->id,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('assignments', [
            'id' => $assignment->id,
            'user_id' => $absentUser->id,
        ]);
    }

    public function test_deferred_assignment_is_prioritized_on_next_generate(): void
    {
        $admin = User::factory()->create();
        User::factory()->create([
            'jenis_jabatan' => 'pimpinan',
            'gender' => 'L',
            'is_active' => true,
        ]);
        User::factory()->create([
            'jenis_jabatan' => 'Struktural',
            'gender' => 'P',
            'is_active' => true,
        ]);

        $deferredUser = User::factory()->create([
            'jenis_jabatan' => 'Staff',
            'gender' => 'L',
            'is_active' => true,
        ]);

        DeferredAssignment::create([
            'user_id' => $deferredUser->id,
            'role' => 'Pembaca Doa',
            'schedule_type' => 'senin',
            'reason' => 'Test deferred',
            'status' => 'pending',
        ]);

        $this
            ->actingAs($admin)
            ->postJson(route('schedules.generate'), [
                'start_date' => '2026-08-03',
                'end_date' => '2026-08-07',
            ]);

        $this->assertDatabaseHas('assignments', [
            'user_id' => $deferredUser->id,
            'role' => 'Pembaca Doa',
        ]);

        $this->assertDatabaseHas('deferred_assignments', [
            'user_id' => $deferredUser->id,
            'status' => 'fulfilled',
        ]);
    }
}
