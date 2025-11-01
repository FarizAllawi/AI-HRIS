<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HRMS\ScreeningController;


Route::prefix('HRMS')->group(function () {
//    Route::middleware(['auth', 'verified', 'role:hrms-user'])->group(function () {
      Route::post('/screening/callback', [ScreeningController::class, 'callback'])->name('screening.callback');
      Route::get('/screening/poll/{task_id}', [ScreeningController::class, 'pollTask']);
//    });
});
