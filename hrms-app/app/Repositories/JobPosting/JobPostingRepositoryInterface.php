<?php

namespace App\Repositories\JobPosting;

use App\Repositories\Contracts\BaseRepositoryInterface;

interface JobPostingRepositoryInterface extends BaseRepositoryInterface
{
    // You can define extra JobPosting-specific methods here if needed.

    /**
     * Update only the status of a job posting
     *
     * @param string $id Job posting ID
     * @param string $status New status value
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function updateStatus(string $id, string $status);
}
