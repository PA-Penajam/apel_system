<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->datetime('scheduled_notification_at')->nullable()->after('notification_sent');
            $table->datetime('notification_sent_at')->nullable()->after('scheduled_notification_at');
            $table->enum('notification_status', ['pending', 'sent', 'skipped', 'failed'])->default('pending')->after('notification_sent_at');
            $table->boolean('is_auto_notification')->default(true)->after('notification_status');
            $table->text('notification_message')->nullable()->after('is_auto_notification');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn([
                'scheduled_notification_at',
                'notification_sent_at',
                'notification_status',
                'is_auto_notification',
                'notification_message',
            ]);
        });
    }
};
