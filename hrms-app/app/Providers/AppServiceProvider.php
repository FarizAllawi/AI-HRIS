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

        Passport::ignoreRoutes();
        // By providing a view name...
        Passport::authorizationView('auth.oauth.authorize');
        Passport::deviceUserCodeView('auth.oauth.device.user-code');
        Passport::deviceAuthorizationView('auth.oauth.device.authorize');
        // By providing a closure...
//        Passport::authorizationView(
//            fn ($parameters) => Inertia::render('Auth/OAuth/Authorize', [
//                'request' => $parameters['request'],
//                'authToken' => $parameters['authToken'],
//                'client' => $parameters['client'],
//                'user' => $parameters['user'],
//                'scopes' => $parameters['scopes'],
//            ])
//        );

        Passport::tokensCan([
            'ai-service:*' => 'AI Service Scopes',
        ]);
    }
}
