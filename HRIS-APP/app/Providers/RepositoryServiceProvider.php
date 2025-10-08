<?php

namespace App\Providers;

use App\Repositories\JobPosting\JobPostingRepository;
use App\Repositories\JobPosting\JobPostingRepositoryInterface;

use Illuminate\support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap Service
     */

     public function boot(): void
     {
        // Job Posting Repository
        $this->app->bind(JobPostingRepositoryInterface::class, JobPostingRepository::class);
     }
}