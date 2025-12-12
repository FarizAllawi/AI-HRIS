<?php

namespace App\Repositories\JobPostingQuestions;

use App\Models\JobPostingQuestion;
use App\Repositories\BaseRepository;
use App\Repositories\JobPostingQuestions\JobPostingQuestionsRepositoryInterface;


class JobPostingQuestionsRepository extends BaseRepository implements JobPostingQuestionsRepositoryInterface
{

    public function __construct(JobPostingQuestion $model)  {
        parent::__construct($model);
    }

    public function deleteByJobPostingId(string $jobPostingId): bool
    {
        return $this->model->newQuery()->where('job_posting_id', $jobPostingId)->forceDelete();
    }
}
