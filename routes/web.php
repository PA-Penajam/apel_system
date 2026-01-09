<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Schedule routes
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::post('/schedules/generate', [ScheduleController::class, 'generate'])->name('schedules.generate');
    Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');
    Route::get('/schedules/{schedule}', [ScheduleController::class, 'show'])->name('schedules.show');

    // Fonnte broadcast routes
    Route::post('/schedules/broadcast', [ScheduleController::class, 'broadcast'])->name('schedules.broadcast');
    Route::post('/schedules/broadcast/individual', [ScheduleController::class, 'broadcastIndividual'])->name('schedules.broadcast.individual');
    Route::post('/schedules/broadcast/all', [ScheduleController::class, 'broadcastAll'])->name('schedules.broadcast.all');

    // Fonnte test routes
    Route::get('/fonnte/test', [ScheduleController::class, 'testConnection'])->name('fonnte.test');
    Route::get('/fonnte/quota', [ScheduleController::class, 'checkQuota'])->name('fonnte.quota');
});

require __DIR__ . '/auth.php';
