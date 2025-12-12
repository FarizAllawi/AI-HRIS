<?php

namespace App\Providers;


use Illuminate\support\ServiceProvider;
use App\Repositories\JobPosting\{
   JobPostingRepository,
   JobPostingRepositoryInterface,
};

use App\Repositories\JobPostingQuestions\{
    JobPostingQuestionsRepositoryInterface,
    JobPostingQuestionsRepository,
};

use App\Repositories\Applicant\{
   ApplicantRepository,
   ApplicantRepositoryInterface,
};

use App\Repositories\Employee\{
   EmployeeRepository,
   EmployeeRepositoryInterface,
};

use App\Repositories\ApplyJob\{
   ApplyJobRepository,
   ApplyJobRepositoryInterface,
};

use App\Repositories\Media\{
    MediaRepository,
    MediaRepositoryInterface,
};


class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap Service
     */

    public function boot(): void
    {
        // Job Posting Repository
        $this->app->bind(JobPostingRepositoryInterface::class, JobPostingRepository::class);
        $this->app->bind(JobPostingQuestionsRepositoryInterface::class, JobPostingQuestionsRepository::class);
        $this->app->bind(EmployeeRepositoryInterface::class, EmployeeRepository::class);
        $this->app->bind(ApplicantRepositoryInterface::class, ApplicantRepository::class);
        $this->app->bind(ApplyJobRepositoryInterface::class, ApplyJobRepository::class);
        $this->app->bind(MediaRepositoryInterface::class, MediaRepository::class);
    }
}
