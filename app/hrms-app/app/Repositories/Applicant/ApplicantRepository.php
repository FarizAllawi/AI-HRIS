<?php

namespace App\Repositories\Applicant;

use App\Models\Applicant;
use App\Models\JobPosting;
use App\Models\User;

use App\Repositories\BaseRepository;
use App\Repositories\Media\MediaRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;


class ApplicantRepository extends BaseRepository implements ApplicantRepositoryInterface
{
    protected MediaRepositoryInterface $mediaRepository;

    public function __construct(Applicant $model, MediaRepositoryInterface $mediaRepository) {
        parent::__construct($model);
        $this->mediaRepository = $mediaRepository; // ✅ Initialize it
    }
    public function all(array $filters = []): Collection
    {
        $query = $this->model->newQuery();

        // Optional search by user name or email
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->whereHas('user', function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]) // user name
                  ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
            });
        }

        // Filter by job posting via relation
        if (!empty($filters['job_posting_id'])) {
            $jobId = $filters['job_posting_id'];
            $query->whereHas('appliedJobs', function ($q) use ($jobId) {
                $q->where('job_posting_id', $jobId);
            });
        }

        // Only applicants who have applied to at least one job
        $query->whereHas('appliedJobs');

        // Eager load relations and only the latest applied job
        $query->with([
            'user',
            'resume',
            'appliedJobs' => function ($q) {
                $q->latest()->limit(1);
            },
            'appliedJobs.jobPosting',
        ]);

        return $query->latest()->get();
    }


    public function updateProfile(User $user, array $data, ?UploadedFile $resumeFile = null): Applicant
    {
        return DB::transaction(function () use ($user, $data, $resumeFile) {
            // Find and lock the applicant for update
            $applicant = $this->model->lockForUpdate()->firstOrNew(['user_id' => $user->id]);
           // Update the Applicant
            $applicant->email = $data['email'];
            $applicant->phone = $data['phone'] ?? null;
            $applicant->portfolio_link = $data['portfolio_link'] ?? null;

            if ($resumeFile) {
                $media = $this->mediaRepository->upload(
                    $resumeFile,
                    isPrivate: true,
                    disk: 'local'
                );
                $applicant->resume_media_id = $media->id;
            }

            $applicant->save();
            return $applicant;
        });
    }

    public function findWithRelations(string $id): Applicant
    {
        return $this->model->newQuery()
            ->with([
                'user',
                'resume',
                // For detail view, load all applied jobs (latest first)
                'appliedJobs' => function ($q) {
                    $q->latest();
                },
                'appliedJobs.jobPosting',
                'appliedJobs.jobPostingAnswers',
                'appliedJobs.jobPostingAnswers.jobPostingQuestion',
            ])
            ->findOrFail($id);
    }
}
