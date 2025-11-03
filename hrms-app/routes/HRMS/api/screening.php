<?php

use Illuminate\Support\Facades\Route;
use Laravel\Passport\Http\Middleware\CheckToken;

use App\Http\Controllers\HRMS\ScreeningController;

Route::prefix('HRMS')->group(function () {
    Route::middleware(['auth:api', CheckToken::using('ai-service:*')])->group(function () {
      Route::post('/screening/callback', [ScreeningController::class, 'callback'])
          ->name('screening.callback');
    });
});
