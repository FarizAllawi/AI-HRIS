<?php

namespace App\Repositories\Applicant;

use App\Models\Applicant;
use Illuminate\Database\Eloquent\Collection;

class ApplicantRepository extends BaseRepository implements ApplicantRepositoryInterface

{
    public function all(array $filters = []): Collection
    {
        $query = Applicant::query();

        if (!empty($filters['job_posting_id'])) {
            $query->where('job_posting_id', $filters['job_posting_id']);
        }

        return $query->with(['user', 'jobPosting'])->get();
    }

    public function find(string $id): ?Applicant
    {
        return Applicant::with(['user', 'jobPosting'])->find($id);
    }
}