<?php

namespace App\Jobs;

use App\Models\Applicant;
use App\Models\AppliedJobAnswer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessApplicantAnswer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $limit = 10) {}

    public function handle(): void
    {
        // ✅ Get applicants with pending answers
        $applicants = Applicant::with([
            'appliedJobs.jobPostingAnswers.jobPostingQuestion.jobPosting',
            'user'
        ])
            ->whereHas('appliedJobs.jobPostingAnswers', fn($q) =>
            $q->where('status', 'pending')
            )
            ->limit($this->limit)
            ->get();

        if ($applicants->isEmpty()) {
            Log::info('No applicants with pending answers found.');
            return;
        }

        $processedAnswerIds = [];
        $payload = ['applicants' => []];

        foreach ($applicants as $applicant) {
            $answers = [];
            $jobPostingId = null;

            foreach ($applicant->appliedJobs as $job) {
                $jobPostingId = $job->jobPosting->id ?? null;

                foreach ($job->jobPostingAnswers as $answer) {
                    if ($answer->status !== 'pending') {
                        continue;
                    }

                    $answers[] = [
                        'id' => $answer->id,
                        'applicant_id' => $applicant->id,
                        'question_id' => $answer->job_posting_question_id,
                        'answer' => $answer->answer,
                    ];

                    $processedAnswerIds[] = $answer->id;
                }
            }

            if (!empty($answers)) {
                $payload['applicants'][] = [
                    'id' => $applicant->id,
                    'job_posting_id' => $jobPostingId,
                    'user_id' => $applicant->user_id,
                    'answers' => $answers,
                ];
            }
        }

        if (empty($payload['applicants'])) {
            Log::info('No pending answers to process.');
            return;
        }

        // ✅ Send all applicants in a single request
        try {
            $url = env('AI_SERVICE_URL', 'http://localhost:8100');
            $response = Http::timeout(30)->post(
                $url . '/screening/applicant/batch',
                $payload
            );

            if ($response->successful()) {
                Log::info("✅ Successfully sent applicants to AI service.");
            } else {
                Log::error("❌ Failed to send applicants.", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error("❌ Exception when sending data: " . $e->getMessage());
        }

        // ✅ Update status to 'processing'
        if (!empty($processedAnswerIds)) {
            AppliedJobAnswer::whereIn('id', $processedAnswerIds)
                ->update([
                    'status' => 'processing',
                    'updated_at' => now(),
                ]);

            Log::info("✅ Updated " . count($processedAnswerIds) . " answers to 'processing' status");
        }
    }
}
