<?php

namespace Tests\Unit;

use App\Models\Schedule;
use App\Models\User;
use App\Services\SchedulerService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchedulerServiceTest extends TestCase
{
    use RefreshDatabase;

    private SchedulerService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new SchedulerService;
    }

    private function createEligiblePool(): void
    {
        User::factory()->create(['name' => 'Pimpinan 1', 'jenis_jabatan' => 'Pimpinan', 'gender' => 'L', 'is_active' => true]);
        User::factory()->create(['name' => 'Struktural L 1', 'jenis_jabatan' => 'Struktural', 'gender' => 'L', 'is_active' => true]);
        User::factory()->create(['name' => 'Struktural L 2', 'jenis_jabatan' => 'Struktural', 'gender' => 'L', 'is_active' => true]);
        User::factory()->create(['name' => 'Struktural P 1', 'jenis_jabatan' => 'Struktural', 'gender' => 'P', 'is_active' => true]);
        User::factory()->create(['name' => 'Staff P 1', 'jenis_jabatan' => 'Staff', 'gender' => 'P', 'is_active' => true]);
        User::factory()->create(['name' => 'Staff L 1', 'jenis_jabatan' => 'Staff', 'gender' => 'L', 'is_active' => true]);
    }

    public function test_same_team_is_assigned_to_monday_and_friday_of_same_week(): void
    {
        $this->createEligiblePool();

        $start = Carbon::parse('2026-08-03');
        $end = Carbon::parse('2026-08-07');

        $this->service->generate($start, $end);

        $monday = Schedule::where('date', '2026-08-03')->first();
        $friday = Schedule::where('date', '2026-08-07')->first();

        $this->assertNotNull($monday);
        $this->assertNotNull($friday);
        $this->assertSame('senin', $monday->type);
        $this->assertSame('jumat', $friday->type);

        foreach (['Pembina Apel', 'Pembaca Doa', 'Pembaca 8 Nilai MA', 'MC', 'Pemimpin Apel', 'Pembaca Lainnya'] as $role) {
            $mondayUserId = $monday->assignments()->where('role', $role)->first()?->user_id;
            $fridayUserId = $friday->assignments()->where('role', $role)->first()?->user_id;

            $this->assertNotNull($mondayUserId, "Role {$role} missing on Monday");
            $this->assertSame($mondayUserId, $fridayUserId, "Role {$role} differs between Monday and Friday");
        }
    }

    public function test_no_user_holds_two_roles_in_same_week(): void
    {
        $this->createEligiblePool();

        $this->service->generate(Carbon::parse('2026-08-03'), Carbon::parse('2026-08-07'));

        $monday = Schedule::where('date', '2026-08-03')->first();
        $userIds = $monday->assignments()->pluck('user_id')->all();

        $this->assertSame(count($userIds), count(array_unique($userIds)));
    }

    public function test_inactive_users_are_not_selected(): void
    {
        $this->createEligiblePool();
        User::factory()->create(['name' => 'Inactive Pimpinan', 'jenis_jabatan' => 'Pimpinan', 'gender' => 'L', 'is_active' => false]);

        $this->service->generate(Carbon::parse('2026-08-03'), Carbon::parse('2026-08-07'));

        $monday = Schedule::where('date', '2026-08-03')->first();
        $pembina = $monday->assignments()->where('role', 'Pembina Apel')->first();

        $this->assertNotNull($pembina);
        $this->assertNotSame('Inactive Pimpinan', $pembina->user->name);
    }

    public function test_primary_role_rules_are_respected(): void
    {
        $this->createEligiblePool();

        $this->service->generate(Carbon::parse('2026-08-03'), Carbon::parse('2026-08-07'));

        $monday = Schedule::where('date', '2026-08-03')->first();

        $pembina = $monday->assignments()->where('role', 'Pembina Apel')->first();
        $this->assertSame('Pimpinan', $pembina->user->jenis_jabatan);

        $pemimpin = $monday->assignments()->where('role', 'Pemimpin Apel')->first();
        $this->assertSame('Staff', $pemimpin->user->jenis_jabatan);
        $this->assertSame('L', $pemimpin->user->gender);

        $mc = $monday->assignments()->where('role', 'MC')->first();
        $this->assertSame('Staff', $mc->user->jenis_jabatan);
        $this->assertSame('P', $mc->user->gender);
    }
}
