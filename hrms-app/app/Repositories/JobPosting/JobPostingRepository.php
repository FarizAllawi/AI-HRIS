<?php

namespace App\Repositories\JobPosting;

use Illuminate\Database\Eloquent\Collection;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;

use App\Repositories\JobPostingQuestions\JobPostingQuestionsRepository;

use App\Models\JobPosting;
use App\Models\JobPostingQuestion;
use Illuminate\Support\Facades\DB;

class JobPostingRepository extends BaseRepository implements JobPostingRepositoryInterface
{
    protected JobPostingQuestionsRepository $jobPostingQuestions;

    public function __construct(JobPosting $model)
    {
        parent::__construct($model);
        $this->jobPostingQuestions = new JobPostingQuestionsRepository(new JobPostingQuestion);
    }

    /**
     * Override all() to support job-specific filters.
     */
    public function all(array $filters = []): Collection
    {
        $query = $this->model->newQuery();

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Flexible search across multiple columns
        if (!empty($filters['title'])) {
            $search = $filters['title'];
            $driver = $this->model->getConnection()->getDriverName();

            $query->where(function ($q) use ($search, $driver) {
                if ($driver === 'pgsql') {
                    // PostgreSQL supports ILIKE for case-insensitive matching
                    $q->where('title', 'ILIKE', "%{$search}%")
                        ->orWhere('description', 'ILIKE', "%{$search}%")
                        ->orWhere('location', 'ILIKE', "%{$search}%")
                        ->orWhere('departments', 'ILIKE', "%{$search}%");
                } else {
                    // SQLite (and others) — emulate ILIKE using LOWER() + LIKE
                    $search = strtolower($search);
                    $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(location) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(departments) LIKE ?', ["%{$search}%"]);
                }
            });
        }

        // Include applicants count for each job posting
        $query->withCount('appliedJobs');

        return $query->latest()->get();
    }

    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data) {
            // Create the job posting
            $jobPosting = $this->model->create([
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'] ?? null,
                'departments' => $data['departments'] ?? null,
                'requirements' => $this->formatArrayData($data['requirements']),
                'responsibilities' => $this->formatArrayData($data['responsibilities']),
                'benefits' => isset($data['benefits']) ? $this->formatArrayData($data['benefits']) : null,
                'salary' => $data['salary'] ?? null,
                'type' => $data['type'],
                'status' => $data['status'],
            ]);

            // Create related job posting questions (if any)
            if (!empty($data['questions'])) {
                foreach ($data['questions'] as $question) {
                    $this->jobPostingQuestions->create([
                        'job_posting_id' => $jobPosting->id,
                        'question' => $question['question'],
                        'description' => $question['description'] ?? null,
                        'weight' => $question['weight'] ?? 0,
                    ]);
                }
            }

            return $jobPosting->load('questions');
        });
    }

    public function update(string $id, array $data): ?Model
    {
        return DB::transaction(function () use ($id, $data) {
            // Find and lock the job posting for update
            $jobPosting = $this->model->lockForUpdate()->findOrFail($id);
            // Update the job posting
            $jobPosting->update([
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'] ?? null,
                'departments' => $data['departments'] ?? null,
                'requirements' => $this->formatArrayData($data['requirements']),
                'responsibilities' => $this->formatArrayData($data['responsibilities']),
                'benefits' => isset($data['benefits']) ? $this->formatArrayData($data['benefits']) : null,
                'salary' => $data['salary'] ?? null,
                'type' => $data['type'],
                'status' => $data['status'],
            ]);

            // Delete existing questions
            $this->jobPostingQuestions->deleteByJobPostingId($jobPosting->id);

            // Create new questions (if any)
            if (!empty($data['questions'])) {
                foreach ($data['questions'] as $question) {
                    $this->jobPostingQuestions->create([
                        'job_posting_id' => $jobPosting->id,
                        'question' => $question['question'],
                        'description' => $question['description'] ?? null,
                        'weight' => $question['weight'] ?? 0,
                    ]);
                }
            }

            return $jobPosting->load('questions');
        });
    }

    /**
     * Update only the status of a job posting (simpler than full update)
     *
     * @param string $id
     * @param string $status
     * @return Model|null
     */
    public function updateStatus(string $id, string $status): ?Model
    {
        return DB::transaction(function () use ($id, $status) {
            $jobPosting = $this->model->lockForUpdate()->findOrFail($id);
            $jobPosting->update(['status' => $status]);
            return $jobPosting;
        });
    }

    /**
     * Format array data to ensure consistent structure
     *
     * @param array $data
     * @return array
     */
    private function formatArrayData(array $data): array
    {
        // Ensure each item has the expected structure with 'value' key
        return array_map(function($item) {
            if (is_array($item) && isset($item['value'])) {
                return $item;
            } elseif (is_string($item)) {
                return ['value' => $item];
            } else {
                return ['value' => (string)$item];
            }
        }, $data);
    }
}
