<?php

namespace App\Repositories\JobPosting;

use App\Models\JobPosting;
use Illuminate\Support\Facades\DB;

class JobPostingRepository implements JobPostingRepositoryInterface
{

    public function paginate(array $filter)
    {}

    public function find(JobPosting $jobPosting)
    {}

    public function create($data)
    {}

    public function update($data)
    {}

    public function delete(JobPosting $jobPosting)
    {}

    public function permanentDelete(JobPosting $jobPosting)
    {}

    public function restore(JobPosting $jobPosting)
    {}
}