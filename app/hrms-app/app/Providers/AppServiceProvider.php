<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        // Passport routes are automatically registered in Passport v13+
        // No need to call Passport::routes() as it doesn't exist in this version

        Passport::tokensCan([
            'ai-service:*' => 'AI Service Scopes',
        ]);
    }
}
