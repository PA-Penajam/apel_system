<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'date',
        'type',
        'is_published',
        'notification_sent',
        'scheduled_notification_at',
        'notification_sent_at',
        'notification_status',
        'is_auto_notification',
        'notification_message',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_notification_at' => 'datetime',
            'notification_sent_at' => 'datetime',
            'is_auto_notification' => 'boolean',
        ];
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
