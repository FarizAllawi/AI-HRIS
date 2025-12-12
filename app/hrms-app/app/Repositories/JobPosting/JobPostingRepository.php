<?php

namespace App\Repositories\JobPosting;

use App\Events\JobPostingEvent;
use Illuminate\Database\Eloquent\Collection;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;
use App\Repositories\JobPostingQuestions\JobPostingQuestionsRepository;
use App\Models\JobPosting;
use App\Models\JobPostingQuestion;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;

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
                    $q->where('title', 'ILIKE', "%{$search}%")
                        ->orWhere('description', 'ILIKE', "%{$search}%")
                        ->orWhere('location', 'ILIKE', "%{$search}%")
                        ->orWhere('departments', 'ILIKE', "%{$search}%");
                } else {
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
            // ✅ Laravel handles JSON casting automatically
            $jobPosting = $this->model->create([
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'] ?? null,
                'departments' => $data['departments'] ?? null,
                'requirements' => $data['requirements'],
                'responsibilities' => $data['responsibilities'],
                'qualifications' => $data['qualifications'],
                'required_skills' => $data['required_skills'] ?? null,
                'preferred_skills' => $data['preferred_skills'] ?? null,
                'benefits' => $data['benefits'] ?? null,
                'salary' => $data['salary'] ?? null,
                'type' => $data['type'],
                'status' => $data['status'],
            ]);

            // ✅ Create related questions (no json_encode)
            if (!empty($data['questions'])) {
                foreach ($data['questions'] as $question) {
                    $this->jobPostingQuestions->create([
                        'job_posting_id' => $jobPosting->id,
                        'question' => $question['question'],
                        'description' => $question['description'] ?? null,
                        'weight' => $question['weight'] ?? 0,
                        'mapped_competencies' => $question['mapped_competencies'] ?? [],
                        'weight_version' => $question['weight_version'] ?? 1,
                    ]);
                }
            }

            $jobPosting->load('questions');

            // Dispatch event after transaction
            event(new JobPostingEvent($jobPosting, 'create'));

            return $jobPosting;

        });
    }

    public function update(string $id, array $data): Model
    {
        return DB::transaction(function () use ($id, $data) {
            $jobPosting = $this->model->with('questions')->findOrFail($id);

            // Update main job posting fields
            $jobPosting->update([
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'] ?? null,
                'departments' => $data['departments'] ?? null,
                'requirements' => $data['requirements'],
                'responsibilities' => $data['responsibilities'],
                'qualifications' => $data['qualifications'],
                'required_skills' => $data['required_skills'] ?? null,
                'preferred_skills' => $data['preferred_skills'] ?? null,
                'benefits' => $data['benefits'] ?? null,
                'salary' => $data['salary'] ?? null,
                'type' => $data['type'],
                'status' => $data['status'],
            ]);

            if (!empty($data['questions'])) {
                // List of questions id that in Job Posting
                $jobPostingQuestionIds = $jobPosting->questions->pluck('id')->toArray();
                foreach ($data['questions'] as $questions) {
                    $questionData = [
                        'job_posting_id' => $jobPosting->id,
                        'question' => $questions['question'],
                        'description' => $questions['description'] ?? null,
                        'weight' => $questions['weight'] ?? 0,
                        'mapped_competencies' => $questions['mapped_competencies'] ?? [],
                        'weight_version' => $questions['weight_version'] ?? 1,
                    ];

                    // If question ID from request has an ID than update it
                    if (!is_null($questions['id']) && Uuid::isValid($questions['id'])) {
                       // Validate is questions really exist in database
                        $existingQuestion = $jobPosting->questions()->where(
                            'id', $questions['id']
                        )->first();

                        // Check is existing weight questions change, required to set for AI Service
                        $oldWeight = $existingQuestion->weight;
                        $shouldIncrementVersion = $oldWeight !== $questions['weight'];

                        $existingQuestion->update([
                            ...$questionData,
                            'weight_version' => $shouldIncrementVersion
                                ? ($existingQuestion->weight_version + 1)
                                : $existingQuestion->weight_version,
                        ]);
                        // Skip the loop
                        continue;
                    }

                    // Create the new question when id is not set from request
                    $this->jobPostingQuestions->create($questionData);
                }

                // Delete removed questions
                $incomingIds = collect($data['questions'])
                    ->pluck('id')
                    ->filter(fn($id) => !is_null($id) && Uuid::isValid($id))
                    ->toArray();

                $toDelete = array_diff($jobPostingQuestionIds, $incomingIds);

                foreach ($toDelete as $jobPostingQuestionId) {
                    $this->jobPostingQuestions->delete($jobPostingQuestionId);
                }
            }
            $jobPosting->loadMissing('questions');

             event(new JobPostingEvent($jobPosting, 'update'));

            return $jobPosting;
        });
    }

    public function updateStatus(string $id, string $status): ?Model
    {
        // Add comprehensive validation
        if (empty($id) || !is_string($id)) {
            throw new \InvalidArgumentException('Job posting ID must be a non-empty string. Received: ' . gettype($id));
        }

        if (empty($status) || !is_string($status)) {
            throw new \InvalidArgumentException('Status must be a non-empty string.');
        }

        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            throw new \InvalidArgumentException('Invalid job posting ID format: ' . $id);
        }

        return DB::transaction(function () use ($id, $status) {
            $jobPosting = $this->model->lockForUpdate()->findOrFail($id);
            $jobPosting->update(['status' => $status]);

            return $jobPosting;
        });
    }
}
