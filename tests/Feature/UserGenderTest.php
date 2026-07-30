<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserGenderTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created_with_valid_gender(): void
    {
        $admin = User::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Test User',
                'nip' => '123456789',
                'jenis_pegawai' => 'PNS',
                'jenis_jabatan' => 'Staff',
                'gender' => 'L',
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'gender' => 'L',
        ]);
    }

    public function test_user_creation_rejects_invalid_gender(): void
    {
        $admin = User::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('users.store'), [
                'name' => 'Test User',
                'nip' => '123456789',
                'jenis_pegawai' => 'PNS',
                'jenis_jabatan' => 'Staff',
                'gender' => 'X',
                'is_active' => true,
            ]);

        $response->assertSessionHasErrors('gender');

        $this->assertDatabaseMissing('users', [
            'name' => 'Test User',
        ]);
    }

    public function test_user_can_be_updated_with_valid_gender(): void
    {
        $admin = User::factory()->create();
        $user = User::factory()->create(['gender' => 'L']);

        $response = $this
            ->actingAs($admin)
            ->put(route('users.update', $user), [
                'name' => $user->name,
                'nip' => $user->nip,
                'jenis_pegawai' => $user->jenis_pegawai,
                'jenis_jabatan' => $user->jenis_jabatan,
                'gender' => 'P',
                'is_active' => $user->is_active,
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'gender' => 'P',
        ]);
    }

    public function test_user_update_rejects_invalid_gender(): void
    {
        $admin = User::factory()->create();
        $user = User::factory()->create(['gender' => 'L']);

        $response = $this
            ->actingAs($admin)
            ->put(route('users.update', $user), [
                'name' => $user->name,
                'nip' => $user->nip,
                'jenis_pegawai' => $user->jenis_pegawai,
                'jenis_jabatan' => $user->jenis_jabatan,
                'gender' => 'invalid',
                'is_active' => $user->is_active,
            ]);

        $response->assertSessionHasErrors('gender');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'gender' => 'L',
        ]);
    }
}
