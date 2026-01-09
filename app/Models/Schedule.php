<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = ['date', 'type', 'is_published', 'notification_sent'];

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
}
