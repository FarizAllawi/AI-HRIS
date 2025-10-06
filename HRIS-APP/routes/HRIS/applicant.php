<?php

use App\Http\Controllers\HRIS\ApplicantController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('HRIS')->group(function () {
    Route::middleware(['auth', 'verified'])->group(function () {

        Route::get('applicant', [ApplicantController::class, 'index'])->name('applicant.index');

        // Route::redirect('settings', '/settings/profile');
        // Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
        // Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');

        // Route::put('settings/password', [PasswordController::class, 'update'])
        //     ->middleware('throttle:6,1')
        //     ->name('password.update');

        // Route::get('settings/appearance', function () {
        //     return Inertia::render('settings/appearance');
        // })->name('appearance.edit');

        // Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        //     ->name('two-factor.show');
    });
});
