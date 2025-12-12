<?php

namespace App\Providers;

use App\Events\JobPostingEvent;
use App\Listeners\SyncJobPostingExternalApi;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        JobPostingEvent::class => [
            SyncJobPostingExternalApi::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
