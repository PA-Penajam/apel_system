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
        Schema::create('deferred_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role');
            $table->enum('schedule_type', ['senin', 'jumat']);
            $table->foreignId('source_assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->string('status')->default('pending'); // pending | fulfilled
            $table->foreignId('fulfilled_schedule_id')->nullable()->constrained('schedules')->nullOnDelete();
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'role', 'schedule_type', 'status']);
            $table->index(['status', 'schedule_type', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deferred_assignments');
    }
};
