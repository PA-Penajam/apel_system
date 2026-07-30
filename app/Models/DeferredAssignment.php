<?php

namespace App\Models;

use Database\Factories\DeferredAssignmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeferredAssignment extends Model
{
    /** @use HasFactory<DeferredAssignmentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'schedule_type',
        'source_assignment_id',
        'reason',
        'status',
        'fulfilled_schedule_id',
        'fulfilled_at',
    ];

    protected function casts(): array
    {
        return [
            'fulfilled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceAssignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'source_assignment_id');
    }

    public function fulfilledSchedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'fulfilled_schedule_id');
    }

    /**
     * Scope for pending deferred assignments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
