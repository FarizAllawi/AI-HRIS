<?php

namespace App\Jobs;

use App\Models\AppliedJob;
use App\Models\AppliedJobAnswer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SendApplicantAnswerCsv implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120]; // backoff per attempt (in seconds)

    public function __construct(
        public string $csvPath,
        public array $appliedJobAnswerIds = []
    ) {}


    public function handle(): void
    {
        try {
            $fileContent = Storage::disk('local')->get($this->csvPath);

            $response = Http::timeout(20)
                ->attach('file', $fileContent, basename($this->csvPath))
                ->post(env('AI_SERVICE_URL') || 'http://localhost:8100' . '/screening/upload');

            if ($response->successful()) {
                Log::info('✅ AI Microservice accepted CSV successfully.');
            } else {
                Log::warning('⚠️ AI Microservice returned an error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('AI Microservice error: ' . $response->status());
            }
        } catch (\Throwable $e) {
            Log::error('❌ AI Microservice communication failed', [
                'message' => $e->getMessage(),
            ]);

            // Mark current batch as failed
            AppliedJobAnswer::whereIn('id', $this->appliedJobAnswerIds)
                ->update(['status' => 'failed']);

            // Rethrow so Laravel retry system can handle it
            throw $e;
        }
    }

    /**
     * Called when the job has failed after all retries
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('💥 SendApplicantCsvToMicroserviceJob permanently failed', [
            'message' => $exception->getMessage(),
        ]);

        // Revert all records back to pending for future reprocessing
        AppliedJobAnswer::whereIn('id', $this->appliedJobAnswerIds)
            ->update([
                'status' => 'pending',
                'last_error' => $exception->getMessage(),
            ]);
    }
}
