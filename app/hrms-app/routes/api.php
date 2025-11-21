<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/passport/public-key', function (Request $request) {
    $expected = config('services.ai-service.secret_key');
    return response()->file(storage_path('oauth-public.key'));
});

require __DIR__.'/HRMS/api/screening.php';
