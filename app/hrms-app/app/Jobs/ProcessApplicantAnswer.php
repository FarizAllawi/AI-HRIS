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
use Illuminate\Support\Facades\Cache;
use Exception;

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

        // 🔐 Get machine-to-machine token (client_credentials) and send request
        try {
            $url = config('services.ai-service.base_url'); 

            $token = $this->fetchAiServiceToken();

            $headers = [];
            if ($token) {
                $headers['Authorization'] = 'Bearer ' . $token;
            } elseif (env('AI_SERVICE_API_KEY')) {
                // fallback shared secret for internal traffic
                $headers['X-Auth-Key'] = env('AI_SERVICE_API_KEY');
            }

            $response = Http::withHeaders($headers)
                ->timeout(30)
                ->post(
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
        } catch (Exception $e) {
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

    /**
     * Fetch and cache client_credentials token for AI service.
     * Caches token using Laravel cache and respects expires_in.
     */
    private function fetchAiServiceToken(): ?string
    {
        $cacheKey = 'ai_service:access_token';

        // Return cached token if available
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $tokenUrl = env('OAUTH_TOKEN_URL', env('AUTH_URL', env('APP_URL', 'http://localhost:8000') . '/oauth/token'));
        $clientId = config('services.ai-service.client_id');
        $clientSecret = config('services.ai-service.client_secret');
        $scope = config('services.ai-service.scope');

        if (empty($clientId) || empty($clientSecret)) {
            Log::warning('AI client credentials not configured. Proceeding without token.');
            return null;
        }

        try {
            $resp = Http::asForm()->post($tokenUrl, [
                'grant_type' => 'client_credentials',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'scope' => $scope,
            ]);

            if ($resp->successful()) {
                $data = $resp->json();
                if (!empty($data['access_token'])) {
                    $expiresIn = isset($data['expires_in']) ? intval($data['expires_in']) : 300;
                    // Subtract a small buffer to avoid near-expiry tokens
                    $ttl = max(60, $expiresIn - 30);
                    Cache::put($cacheKey, $data['access_token'], $ttl);
                    Log::info("AI Service token: " . $data['access_token']);
                    return $data['access_token'];
                }
                Log::error('Invalid token response from OAuth server', ['body' => $resp->body()]);
            } else {
                Log::error('Failed to fetch AI service token', ['status' => $resp->status(), 'body' => $resp->body()]);
            }
        } catch (Exception $e) {
            Log::error('Exception when fetching AI service token: ' . $e->getMessage());
        }

        return null;
    }
}
