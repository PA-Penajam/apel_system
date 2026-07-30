<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchedulePetugasUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_petugas_can_be_updated_for_a_schedule(): void
    {
        $admin = User::factory()->create();
        $schedule = Schedule::create([
            'date' => now()->toDateString(),
            'type' => 'senin',
            'is_published' => false,
        ]);

        $roles = [
            'Pembina Apel',
            'Pembaca Doa',
            'Pembaca 8 Nilai MA',
            'MC',
            'Pemimpin Apel',
            'Pembaca Lainnya',
        ];

        $initialAssignee = User::factory()->create();
        $newAssignees = User::factory()->count(count($roles))->create();

        $assignments = collect($roles)->map(function ($role) use ($schedule, $initialAssignee) {
            return Assignment::create([
                'schedule_id' => $schedule->id,
                'user_id' => $initialAssignee->id,
                'role' => $role,
            ]);
        });

        $payload = $assignments->values()->map(function ($assignment, $index) use ($newAssignees) {
            return [
                'id' => $assignment->id,
                'role' => $assignment->role,
                'user_id' => $newAssignees[$index]->id,
            ];
        })->all();

        $response = $this
            ->actingAs($admin)
            ->put(route('schedules.petugas.update', $schedule), [
                'assignments' => $payload,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        foreach ($payload as $assignmentData) {
            $this->assertDatabaseHas('assignments', [
                'id' => $assignmentData['id'],
                'user_id' => $assignmentData['user_id'],
                'role' => $assignmentData['role'],
            ]);
        }

        $this->assertSame('pending', $schedule->refresh()->notification_status);
    }

    public function test_update_petugas_requires_valid_assignment_ids(): void
    {
        $user = User::factory()->create();
        $schedule = Schedule::create([
            'date' => now()->toDateString(),
            'type' => 'senin',
            'is_published' => false,
        ]);

        $response = $this
            ->actingAs($user)
            ->put(route('schedules.petugas.update', $schedule), [
                'assignments' => [
                    [
                        'id' => 999999,
                        'role' => 'Pembina Apel',
                        'user_id' => $user->id,
                    ],
                ],
            ]);

        $response->assertSessionHasErrors('assignments.0.id');
    }

    public function test_edit_manual_does_not_create_deferred_assignment(): void
    {
        $admin = User::factory()->create();
        $userA = User::factory()->create(['name' => 'User A']);
        $userB = User::factory()->create(['name' => 'User B']);

        $schedule = Schedule::create([
            'date' => '2026-08-03',
            'type' => 'senin',
            'notification_status' => 'pending',
        ]);

        $assignment = Assignment::create([
            'schedule_id' => $schedule->id,
            'user_id' => $userA->id,
            'role' => 'Pembaca Doa',
        ]);

        $this
            ->actingAs($admin)
            ->put(route('schedules.petugas.update', $schedule), [
                'assignments' => [
                    [
                        'id' => $assignment->id,
                        'role' => 'Pembaca Doa',
                        'user_id' => $userB->id,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('assignments', [
            'id' => $assignment->id,
            'user_id' => $userB->id,
        ]);

        $this->assertDatabaseMissing('deferred_assignments', [
            'user_id' => $userA->id,
            'role' => 'Pembaca Doa',
        ]);
    }
}
