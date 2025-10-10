<?php

namespace App\Providers;

use App\Models\JobPosting;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider 
{
    /**
     * Bootstrap services.
     */

    public function boot(): void 
    {
        Route::model('jobPosting', JobPosting::class); 
        // Route::bind('divisi', function ($divisi) {
        //     return Divisi::withTrashed()->where('id', $divisi)->firstOrFail();
        // });
    }
}