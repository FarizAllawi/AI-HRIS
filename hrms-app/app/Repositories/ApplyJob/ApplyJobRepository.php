<?php

namespace App\Repositories\ApplyJob;

use App\Models\Applicant;
use App\Models\AppliedJob;
use App\Models\AppliedJobAnswer;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplyJobRepository implements ApplyJobRepositoryInterface
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
    public function apply(JobPosting $jobPosting, User $user, array $data): AppliedJob
    {
        return DB::transaction(function () use ($jobPosting, $user, $data) {
            // Create or update applicant profile
            $applicantData  = [
                'email' => $data['email'],
                'phone' => $data['phone'],
                'portfolio_link' => $data['portfolioLink'] ?? null,
            ];

            if ($data['resumeFile']) {
                $applicantData['resume_file'] = $this->storeResumeFile($data['resumeFile']);
            }
            $applicant = Applicant::updateOrCreate(
                ['user_id' => $user->id],
                $applicantData
            );

            // Check if already applied
            $existingApplication = AppliedJob::where([
                'job_posting_id' => $jobPosting->id,
                'applicant_id' => $applicant->id,
            ])->first();

            if ($existingApplication) {
                throw new \Exception('You have already applied for this position.');
            }

            // Create application
            $appliedJob = AppliedJob::create([
                'job_posting_id' => $jobPosting->id,
                'applicant_id' => $applicant->id,
                'ai_screening_score' => null,
                'hr_screening_score' => null,
            ]);

            // Save answers to job posting questions
            if (!empty($data['answers'])) {
                foreach ($data['answers'] as $questionId => $answer) {
                    if (!empty($answer)) {
                        AppliedJobAnswer::create([
                            'applied_job_id' => $appliedJob->id,
                            'job_posting_question_id' => $questionId,
                            'answer' => $answer,
                        ]);
                    }
                }
            }

            return $appliedJob;
        });
    }

    /**
     * Store the uploaded resume file.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @return string
     */
    private function storeResumeFile($file): string
    {
        $filename = time() . '_' . $file->getClientOriginalName();
        return $file->storeAs('resumes', $filename, 'public');
    }
}
