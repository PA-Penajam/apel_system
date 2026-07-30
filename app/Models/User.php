<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'jabatan',
        'jenis_pegawai',
        'jenis_jabatan',
        'unit_id',
        'role',
        'phone',
        'gender',
        'nip',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * Check if user is male
     */
    public function isMale(): bool
    {
        return $this->gender === 'L';
    }

    /**
     * Check if user is female
     */
    public function isFemale(): bool
    {
        return $this->gender === 'P';
    }

    /**
     * Check if user is pimpinan
     */
    public function isPimpinan(): bool
    {
        return $this->jenis_jabatan === 'pimpinan';
    }

    /**
     * Check if user is structural
     */
    public function isStructural(): bool
    {
        return $this->jenis_jabatan === 'Struktural';
    }

    /**
     * Check if user is functional
     */
    public function isFunctional(): bool
    {
        return $this->jenis_jabatan === 'Fungsional';
    }

    /**
     * Check if user is staff
     */
    public function isStaff(): bool
    {
        return $this->jenis_jabatan === 'Staff';
    }
}
