<?php

use App\Http\Controllers\JobPostingPublicController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/job-posting', [JobPostingPublicController::class, 'index'])->name('job-posting-public.index');
Route::get('/job-posting/{jobPosting}', [JobPostingPublicController::class, 'show'])->name('job-posting-public.show');

Route::prefix('HRIS')->group(function() {
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('HRIS/dashboard');
        })->name('dashboard');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/HRIS/job-posting.php';
require __DIR__.'/HRIS/employee.php';
require __DIR__.'/HRIS/interview-schedule.php';
require __DIR__.'/HRIS/applicant.php';

