<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's route middleware groups.
     * We add ForceJsonForApi to the api group to force JSON responses.
     * Keeping the rest minimal — Laravel will merge with framework defaults.
     */
    protected $middlewareGroups = [
        'api' => [
            // Force API routes to accept JSON responses
            'force.json',
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    // Register route middleware following Laravel 12.x standard
    protected $routeMiddleware = [
        // ...existing route middleware...
        'force.json' => \App\Http\Middleware\ForceJsonForApi::class,
    ];

    // ...existing code...
}
