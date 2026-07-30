<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\RoleEligibilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleEligibilityServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_returns_expected_order(): void
    {
        $roles = RoleEligibilityService::roles();

        $this->assertSame([
            'Pembina Apel',
            'Pembaca Doa',
            'Pembaca 8 Nilai MA',
            'MC',
            'Pemimpin Apel',
            'Pembaca Lainnya',
        ], $roles);
    }

    public function test_pembina_eligible_only_for_pimpinan(): void
    {
        $pimpinan = User::factory()->create(['jenis_jabatan' => 'Pimpinan', 'is_active' => true]);
        $struktural = User::factory()->create(['jenis_jabatan' => 'Struktural', 'is_active' => true]);
        $staff = User::factory()->create(['jenis_jabatan' => 'Staff', 'is_active' => true]);

        $this->assertTrue(RoleEligibilityService::isEligible($pimpinan, 'Pembina Apel'));
        $this->assertFalse(RoleEligibilityService::isEligible($struktural, 'Pembina Apel'));
        $this->assertFalse(RoleEligibilityService::isEligible($staff, 'Pembina Apel'));
    }

    public function test_inactive_user_is_not_eligible_for_any_role(): void
    {
        $user = User::factory()->create([
            'jenis_jabatan' => 'Pimpinan',
            'is_active' => false,
        ]);

        foreach (RoleEligibilityService::roles() as $role) {
            $this->assertFalse(RoleEligibilityService::isEligible($user, $role));
        }
    }

    public function test_pemimpin_apel_primary_is_staff_male(): void
    {
        $staffMale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'L', 'is_active' => true]);
        $staffFemale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'P', 'is_active' => true]);
        $strukturalMale = User::factory()->create(['jenis_jabatan' => 'Struktural', 'gender' => 'L', 'is_active' => true]);

        $this->assertTrue(RoleEligibilityService::isEligible($staffMale, 'Pemimpin Apel'));
        $this->assertTrue(RoleEligibilityService::isEligible($staffFemale, 'Pemimpin Apel'));
        $this->assertTrue(RoleEligibilityService::isEligible($strukturalMale, 'Pemimpin Apel'));
    }

    public function test_mc_primary_is_staff_female(): void
    {
        $staffFemale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'P', 'is_active' => true]);
        $staffMale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'L', 'is_active' => true]);
        $fungsionalFemale = User::factory()->create(['jenis_jabatan' => 'Fungsional', 'gender' => 'P', 'is_active' => true]);

        $this->assertTrue(RoleEligibilityService::isEligible($staffFemale, 'MC'));
        $this->assertTrue(RoleEligibilityService::isEligible($staffMale, 'MC'));
        $this->assertTrue(RoleEligibilityService::isEligible($fungsionalFemale, 'MC'));
    }

    public function test_pembaca_doa_primary_is_structural_or_functional_male(): void
    {
        $strukturalMale = User::factory()->create(['jenis_jabatan' => 'Struktural', 'gender' => 'L', 'is_active' => true]);
        $fungsionalMale = User::factory()->create(['jenis_jabatan' => 'Fungsional', 'gender' => 'L', 'is_active' => true]);
        $staffMale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'L', 'is_active' => true]);
        $staffFemale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'P', 'is_active' => true]);

        $this->assertTrue(RoleEligibilityService::isEligible($strukturalMale, 'Pembaca Doa'));
        $this->assertTrue(RoleEligibilityService::isEligible($fungsionalMale, 'Pembaca Doa'));
        $this->assertTrue(RoleEligibilityService::isEligible($staffMale, 'Pembaca Doa'));
        $this->assertTrue(RoleEligibilityService::isEligible($staffFemale, 'Pembaca Doa'));
    }

    public function test_pembaca_8_nilai_primary_is_structural_or_functional_female(): void
    {
        $strukturalFemale = User::factory()->create(['jenis_jabatan' => 'Struktural', 'gender' => 'P', 'is_active' => true]);
        $fungsionalFemale = User::factory()->create(['jenis_jabatan' => 'Fungsional', 'gender' => 'P', 'is_active' => true]);
        $staffMale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'L', 'is_active' => true]);

        $this->assertTrue(RoleEligibilityService::isEligible($strukturalFemale, 'Pembaca 8 Nilai MA'));
        $this->assertTrue(RoleEligibilityService::isEligible($fungsionalFemale, 'Pembaca 8 Nilai MA'));
        $this->assertTrue(RoleEligibilityService::isEligible($staffMale, 'Pembaca 8 Nilai MA'));
    }

    public function test_pembaca_lainnya_primary_is_staff_female(): void
    {
        $staffFemale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'P', 'is_active' => true]);
        $staffMale = User::factory()->create(['jenis_jabatan' => 'Staff', 'gender' => 'L', 'is_active' => true]);
        $fungsionalFemale = User::factory()->create(['jenis_jabatan' => 'Fungsional', 'gender' => 'P', 'is_active' => true]);

        $this->assertTrue(RoleEligibilityService::isEligible($staffFemale, 'Pembaca Lainnya'));
        $this->assertTrue(RoleEligibilityService::isEligible($staffMale, 'Pembaca Lainnya'));
        $this->assertTrue(RoleEligibilityService::isEligible($fungsionalFemale, 'Pembaca Lainnya'));
    }
}
