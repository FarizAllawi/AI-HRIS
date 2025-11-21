<?php

use Illuminate\Support\Facades\Route;
use Laravel\Passport\Http\Middleware\CheckToken;

use App\Http\Controllers\HRMS\ScreeningController;

Route::prefix('HRMS')->group(function () {
    // Use CheckToken (client credentials) for machine-to-machine calls — do not run the session-based `auth:api` first
    Route::middleware([CheckToken::using('ai-service:*')])->group(function () {
      Route::post('/screening/callback', [ScreeningController::class, 'callback'])
          ->name('screening.callback');
    });
});
