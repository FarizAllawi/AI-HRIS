<?php

namespace App\Repositories\ApplyJob;

use App\Models\AppliedJob;
use App\Models\JobPosting;
use App\Models\User;

interface ApplyJobRepositoryInterface
{
    /**
     * Submit a job application for a user.
     *
     * @param JobPosting $jobPosting
     * @param User $user
     * @param array $data Application data (email, phone, portfolio_link, resume_file, answers)
     * @return AppliedJob
     * @throws \Exception If user has already applied
     */
    public function apply(JobPosting $jobPosting, User $user, array $data): AppliedJob;
}
