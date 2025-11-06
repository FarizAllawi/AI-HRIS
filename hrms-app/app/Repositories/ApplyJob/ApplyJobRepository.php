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

    /**
     * Apply screening results to applied jobs and answers.
     *
     * @param array $screeningResults Either an array of results or an array with key 'screening_results'.
     * @return void
     */
    public function applyJobResult(array $screeningResults): void
    {
        DB::transaction(function () use ($screeningResults) {
            $entries = $screeningResults['screening_results'] ?? $screeningResults;

            if (!is_array($entries)) {
                return;
            }

            foreach ($entries as $result) {
                if (empty($result['applicant_id']) || empty($result['job_posting_id'])) {
                    continue;
                }

                // Find the applied job for this applicant + job posting
                $appliedJob = AppliedJob::where('job_posting_id', $result['job_posting_id'])
                    ->where('applicant_id', $result['applicant_id'])
                    ->first();

                if (! $appliedJob) {
                    // No applied job found, skip
                    continue;
                }

                // Update the overall AI screening score if provided
                if (array_key_exists('total_score', $result)) {
                    $appliedJob->ai_screening_score = $result['total_score'];
                    $appliedJob->save();
                }

                // Update per-question AI scores
                if (!empty($result['question_scores']) && is_array($result['question_scores'])) {
                    foreach ($result['question_scores'] as $q) {
                        if (empty($q['question_id'])) {
                            continue;
                        }

                        $answer = AppliedJobAnswer::where('applied_job_id', $appliedJob->id)
                            ->where('job_posting_question_id', $q['question_id'])
                            ->first();

                        if ($answer) {
                            if (array_key_exists('total_question_score', $q)) {
                                $answer->ai_score = $q['total_question_score'];
                            }

                            // mark as completed and set screened timestamp if not set
                            $answer->ai_score_meta = $result['question_scores'];
                            $answer->status = 'completed';
                            $answer->ai_screened_at = $answer->ai_screened_at ?? now();

                            $answer->save();
                        }
                    }
                }
            }
        });
    }
}
