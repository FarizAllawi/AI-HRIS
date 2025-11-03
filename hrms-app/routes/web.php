<?php

use App\Http\Controllers\JobPostingPublicController;
use App\Http\Controllers\MediaController;

use Laravel\Passport\Passport;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('media')->group(function () {
    Route::get('/', [MediaController::class, 'index']);
    Route::post('/upload', [MediaController::class, 'upload']);
    Route::get('/{id}/stream', [MediaController::class, 'stream']);
    Route::get('/{id}/download', [MediaController::class, 'download']);
    Route::delete('/{id}', [MediaController::class, 'destroy']);
    Route::post('/{id}/share', [MediaController::class, 'generateShareLink']);
    Route::get('/access/{token}', [MediaController::class, 'accessViaToken'])->name('media.access');
});

Route::get('/job-openings', [JobPostingPublicController::class, 'index'])->name('job-posting-public.index');
Route::get('/job-openings/{jobPosting}', [JobPostingPublicController::class, 'show'])->name('job-posting-public.show');

Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::get('/job-openings/{jobPosting}/apply', [JobPostingPublicController::class, 'apply'])->name('job-posting-public.apply');
    Route::post('/job-openings/{jobPosting}/apply', [JobPostingPublicController::class, 'postApply'])->name('job-posting-public.post-apply');
    Route::get('/my-applications', [JobPostingPublicController::class, 'myApplications'])->name('job-posting-public.my-applications');
    Route::post('/my-applications/profile', [JobPostingPublicController::class, 'updateMyProfile'])->name('job-posting-public.update-my-profile');
});


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::prefix('HRMS')->group(function() {
    Route::middleware(['auth', 'verified', 'role:hrms-user'])->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('HRMS/dashboard');
        })->name('dashboard');
    });
});

Route::group([
    'as' => 'passport.',
    'prefix' => config('passport.path', 'oauth'),
    'namespace' => '\Laravel\Passport\Http\Controllers',
], function () {
    Route::post('/token', [
        'uses' => 'AccessTokenController@issueToken',
        'as' => 'token',
        'middleware' => 'throttle',
    ]);

    Route::get('/authorize', [
        'uses' => 'AuthorizationController@authorize',
        'as' => 'authorizations.authorize',
        'middleware' => 'web',
    ]);

    if (Passport::$deviceCodeGrantEnabled) {
        Route::get('/device', [
            'uses' => 'DeviceUserCodeController',
            'as' => 'device',
            'middleware' => 'web',
        ]);

        Route::post('/device/code', [
            'uses' => 'DeviceCodeController',
            'as' => 'device.code',
            'middleware' => 'throttle',
        ]);
    }

    $guard = config('passport.guard', null);

    Route::middleware(['web', $guard ? 'auth:'.$guard : 'auth'])->group(function () {
        Route::post('/token/refresh', [
            'uses' => 'TransientTokenController@refresh',
            'as' => 'token.refresh',
        ]);

        Route::post('/authorize', [
            'uses' => 'ApproveAuthorizationController@approve',
            'as' => 'authorizations.approve',
        ]);

        Route::delete('/authorize', [
            'uses' => 'DenyAuthorizationController@deny',
            'as' => 'authorizations.deny',
        ]);

        if (Passport::$deviceCodeGrantEnabled) {
            Route::get('/device/authorize', [
                'uses' => 'DeviceAuthorizationController',
                'as' => 'device.authorizations.authorize',
            ]);

            Route::post('/device/authorize', [
                'uses' => 'ApproveDeviceAuthorizationController',
                'as' => 'device.authorizations.approve',
            ]);

            Route::delete('/device/authorize', [
                'uses' => 'DenyDeviceAuthorizationController',
                'as' => 'device.authorizations.deny',
            ]);
        }
    });
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/HRMS/job-posting.php';
require __DIR__.'/HRMS/applicant.php';
require __DIR__.'/HRMS/employee.php';
require __DIR__.'/HRMS/interview-schedule.php';
