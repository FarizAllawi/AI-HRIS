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
        Route::middleware('api')
            ->prefix('api')
            ->group(base_path('routes/api.php'));

        Route::middleware('web')
            ->group(base_path('routes/web.php'));

        Route::model('jobPosting', JobPosting::class);
        // Route::bind('divisi', function ($divisi) {
        //     return Divisi::withTrashed()->where('id', $divisi)->firstOrFail();
        // });
    }
}
