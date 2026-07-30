<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_users_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('users.index'));

        $response->assertStatus(200);
    }

    public function test_can_toggle_user_active_status(): void
    {
        $admin = User::factory()->create();
        $targetUser = User::factory()->create(['is_active' => true]);

        $this->assertTrue($targetUser->is_active);

        // Toggle to inactive
        $response = $this->actingAs($admin)
            ->from(route('users.index'))
            ->patch(route('users.toggle-status', $targetUser->id));

        $response->assertRedirect(route('users.index'));
        $targetUser->refresh();
        $this->assertFalse($targetUser->is_active);

        // Toggle back to active
        $response = $this->actingAs($admin)
            ->from(route('users.index'))
            ->patch(route('users.toggle-status', $targetUser->id));

        $response->assertRedirect(route('users.index'));
        $targetUser->refresh();
        $this->assertTrue($targetUser->is_active);
    }

    public function test_can_store_new_user(): void
    {
        $admin = User::factory()->create();

        $response = $this->actingAs($admin)
            ->from(route('users.index'))
            ->post(route('users.store'), [
                'name' => 'Budi Santoso',
                'nip' => '199001012020011001',
                'email' => 'budi@example.com',
                'jabatan' => 'Staff IT',
                'jenis_pegawai' => 'PNS',
                'jenis_jabatan' => 'Staff',
                'gender' => 'L',
                'phone' => '08123456789',
            ]);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'name' => 'Budi Santoso',
            'nip' => '199001012020011001',
            'jenis_pegawai' => 'PNS',
            'jenis_jabatan' => 'Staff',
            'is_active' => true,
        ]);
    }

    public function test_can_update_user_details_and_position(): void
    {
        $admin = User::factory()->create();
        $targetUser = User::factory()->create([
            'name' => 'Siti Rahma',
            'jabatan' => 'Staff Biasa',
            'jenis_pegawai' => 'CPNS',
            'jenis_jabatan' => 'Staff',
            'gender' => 'P',
        ]);

        $response = $this->actingAs($admin)
            ->from(route('users.index'))
            ->put(route('users.update', $targetUser->id), [
                'name' => 'Siti Rahma, S.H.',
                'nip' => '199505052020012002',
                'email' => 'siti@example.com',
                'jabatan' => 'Kasubbag PTIP',
                'jenis_pegawai' => 'PNS',
                'jenis_jabatan' => 'Struktural',
                'gender' => 'P',
                'phone' => '08987654321',
                'is_active' => true,
            ]);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'Siti Rahma, S.H.',
            'jabatan' => 'Kasubbag PTIP',
            'jenis_pegawai' => 'PNS',
            'jenis_jabatan' => 'Struktural',
        ]);
    }
}
