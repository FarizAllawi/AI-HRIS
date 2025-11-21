<?php

namespace App\Listeners;

use App\Events\JobPostingEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;

class SyncJobPostingExternalApi implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 5;
    public array $backoff = [10, 30, 60, 120, 300];
    public int $timeout = 60;

    public function retryUntil(): \DateTime
    {
        return now()->addHours(2);
    }

    public function handle(JobPostingEvent $event): void
    {
        $jobPosting = $event->jobPosting->load('questions');
        $action = $event->action;

        $payload = $this->preparePayload($jobPosting);

        try {
            $this->sendToExternalAPI($payload, $action, $jobPosting->id);
        } catch (ConnectionException $e) {
            Log::warning('Connection error syncing job posting - will retry', [
                'job_posting_id' => $jobPosting->id,
                'action' => $action,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            $this->handleRetry($e, $jobPosting->id, $action);
        } catch (RequestException $e) {
            $this->handleHttpError($e, $jobPosting->id, $action, $payload);
        } catch (\Exception $e) {
            Log::error('Unexpected error syncing job posting', [
                'job_posting_id' => $jobPosting->id,
                'action' => $action,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->handleRetry($e, $jobPosting->id, $action);
        }
    }

    private function preparePayload($jobPosting): array
    {
        return [
            'id' => $jobPosting->id,
            'title' => $jobPosting->title,
            'description' => $jobPosting->description,
            'location' => $jobPosting->location,
            'departments' => $jobPosting->departments,
            'requirements' => $jobPosting->requirements,
            'responsibilities' => $jobPosting->responsibilities,
            'qualifications' => $jobPosting->qualifications,
            'required_skills' => $jobPosting->required_skills,
            'preferred_skills' => $jobPosting->preferred_skills,
            'benefits' => $jobPosting->benefits,
            'salary' => $jobPosting->salary,
            'type' => $jobPosting->type,
            'status' => $jobPosting->status,
            'questions' => $jobPosting->questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    "job_posting_id" => $question->job_posting_id,
                    'question' => $question->question,
                    'description' => $question->description,
                    'weight' => $question->weight,
                    'mapped_competencies' => $question->mapped_competencies,
                    'weight_version' => $question->weight_version,
                ];
            })->toArray(),
            'synced_at' => now()->toIso8601String(),
        ];
    }

    private function sendToExternalAPI(array $payload, string $action, string $jobPostingId): void
    {
        $url = config('services.ai-service.base_url').'/job-posting';

        // Prepare headers and include Authorization if available
        $headers = [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];

        $token = $this->fetchAiServiceToken();
        $headers['Authorization'] = 'Bearer ' . $token;

        $response = Http::timeout(30)
            ->retry(3, 100, function ($exception, $request) {
                return $exception instanceof ConnectionException;
            })
            ->withHeaders($headers);

        if ($action === 'create') {
            $response = $response->post($url, $payload);
        } else {
            $response = $response->put($url.'/'.$payload['id'], $payload);
        }

        if ($response->successful()) {
            Log::info('Successfully synced job posting to external API', [
                'job_posting_id' => $jobPostingId,
                'action' => $action,
                'status_code' => $response->status(),
            ]);
        } else {
            $response->throw();
        }
    }

    private function handleHttpError(RequestException $e, string $jobPostingId, string $action, array $payload): void
    {
        $statusCode = $e->response->status();
        $responseBody = $e->response->body();

        // Try to decode JSON response
        $decodedResponse = null;
        try {
            $decodedResponse = $e->response->json();
        } catch (\Exception $jsonException) {
            $decodedResponse = $responseBody;
        }

        // Extract validation errors if present
        $validationErrors = $this->extractValidationErrors($decodedResponse);

        $logContext = [
            'job_posting_id' => $jobPostingId,
            'action' => $action,
            'status_code' => $statusCode,
            'response' => $decodedResponse,
            'attempt' => $this->attempts(),
        ];

        if ($validationErrors) {
            $logContext['validation_errors'] = $validationErrors;
        }

        // Handle different status codes
        if ($statusCode === 422) {
            // Validation error - don't retry
            Log::error('Validation error from external API - job will NOT be retried', $logContext);

            // Store the validation error details for manual review
            $this->storeValidationError($jobPostingId, $action, $validationErrors, $payload);

            // Mark job as failed permanently
            $this->fail($e);

        } elseif (in_array($statusCode, [408, 429, 503, 504])) {
            // Timeout, Rate Limit, Service Unavailable, Gateway Timeout - retry
            Log::warning('Retriable HTTP error from external API', $logContext);
            $this->handleRetry($e, $jobPostingId, $action);

        } elseif ($statusCode >= 400 && $statusCode < 500) {
            // Other client errors (400, 401, 403, 404, etc.) - don't retry
            Log::error('Client error from external API - job will NOT be retried', $logContext);
            $this->storeFailedSync($jobPostingId, $action, $e, $payload, 'client_error');
            $this->fail($e);

        } elseif ($statusCode >= 500) {
            // Server errors - retry
            Log::error('Server error from external API - will retry', $logContext);
            $this->handleRetry($e, $jobPostingId, $action);

        } else {
            // Unknown status code - retry to be safe
            Log::warning('Unknown HTTP status code - will retry', $logContext);
            $this->handleRetry($e, $jobPostingId, $action);
        }
    }

    /**
     * Extract validation errors from API response.
     */
    private function extractValidationErrors($response): ?array
    {
        if (!is_array($response)) {
            return null;
        }

        // Handle FastAPI/Pydantic style errors
        if (isset($response['detail']) && is_array($response['detail'])) {
            $errors = [];
            foreach ($response['detail'] as $error) {
                $field = is_array($error['loc'] ?? null)
                    ? implode('.', array_slice($error['loc'], 1)) // Remove 'body' prefix
                    : ($error['loc'] ?? 'unknown');

                $errors[$field] = [
                    'message' => $error['msg'] ?? 'Validation error',
                    'type' => $error['type'] ?? 'unknown',
                    'input' => $error['input'] ?? null,
                ];
            }
            return $errors;
        }

        // Handle Laravel style errors
        if (isset($response['errors'])) {
            return $response['errors'];
        }

        // Handle simple message
        if (isset($response['message'])) {
            return ['general' => $response['message']];
        }

        return null;
    }

    /**
     * Store validation error for manual review.
     */
    private function storeValidationError(string $jobPostingId, string $action, ?array $validationErrors, array $payload): void
    {
        try {
            \DB::table('failed_job_posting_syncs')->insert([
                'job_posting_id' => $jobPostingId,
                'action' => $action,
                'error_type' => 'validation_error',
                'error_message' => 'Validation failed from external API',
                'validation_errors' => json_encode($validationErrors),
                'payload' => json_encode($payload),
                'failed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('Stored validation error for manual review', [
                'job_posting_id' => $jobPostingId,
                'validation_errors' => $validationErrors,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store validation error', [
                'job_posting_id' => $jobPostingId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function handleRetry(\Exception $e, string $jobPostingId, string $action): void
    {
        if ($this->attempts() >= $this->tries) {
            Log::critical('Max retry attempts reached for job posting sync', [
                'job_posting_id' => $jobPostingId,
                'action' => $action,
                'attempts' => $this->attempts(),
                'error' => $e->getMessage(),
            ]);

            $this->notifyAdmins($jobPostingId, $action, $e);
            $this->fail($e);
        } else {
            $delaySeconds = $this->backoff[$this->attempts() - 1] ?? 300;

            Log::info('Retrying job posting sync', [
                'job_posting_id' => $jobPostingId,
                'action' => $action,
                'attempt' => $this->attempts(),
                'next_retry_in_seconds' => $delaySeconds,
                'next_retry_at' => now()->addSeconds($delaySeconds)->toDateTimeString(),
            ]);

            $this->release($delaySeconds);
        }
    }

    public function failed(JobPostingEvent $event, \Throwable $exception): void
    {
        Log::critical('Job posting sync permanently failed', [
            'job_posting_id' => $event->jobPosting->id,
            'action' => $event->action,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);

        $this->notifyAdmins($event->jobPosting->id, $event->action, $exception);

        $payload = $this->preparePayload($event->jobPosting->load('questions'));
        $this->storeFailedSync($event->jobPosting->id, $event->action, $exception, $payload, 'max_retries_exceeded');
    }

    private function notifyAdmins(string $jobPostingId, string $action, \Throwable $exception): void
    {
        // Implement notification logic
        // Example:
        // \Illuminate\Support\Facades\Notification::route('mail', config('mail.admin_email'))
        //     ->notify(new \App\Notifications\JobPostingSyncFailed($jobPostingId, $action, $exception));
    }

    private function storeFailedSync(string $jobPostingId, string $action, \Throwable $exception, array $payload, string $errorType): void
    {
        try {
            \DB::table('failed_job_posting_syncs')->insert([
                'job_posting_id' => $jobPostingId,
                'action' => $action,
                'error_type' => $errorType,
                'error_message' => $exception->getMessage(),
                'error_trace' => $exception->getTraceAsString(),
                'payload' => json_encode($payload),
                'failed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store failed sync', [
                'job_posting_id' => $jobPostingId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    // Fetch and cache client_credentials token for AI service
    private function fetchAiServiceToken(): ?string
    {
        $cacheKey = 'ai_service:access_token';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $tokenUrl = config('app.url', 'http://localhost:8000') . '/oauth/token';
        $clientId = config('services.ai-service.client_id');
        $clientSecret = config('services.ai-service.client_secret');
        $scope = config('services.ai-service.scope', 'ai-service');

        if (empty($clientId) || empty($clientSecret)) {
            Log::warning('AI client credentials not configured for job posting sync.');
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
                    $ttl = max(60, $expiresIn - 30);
                    Cache::put($cacheKey, $data['access_token'], $ttl);
                    Log::info('Fetched AI service token for job posting sync.');
                    Log::info("Access Token: " . $data['access_token']);
                    return $data['access_token'];
                }
                Log::error('Invalid token response from OAuth server during job posting sync', ['body' => $resp->body()]);
            } else {
                Log::error('Failed to fetch AI service token during job posting sync', ['status' => $resp->status(), 'body' => $resp->body()]);
            }
        } catch (\Exception $e) {
            Log::error('Exception when fetching AI service token during job posting sync: ' . $e->getMessage());
        }

        return null;
    }

}
