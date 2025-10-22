<?php

namespace App\Jobs;

use App\Models\Applicant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class ProcessApplicantAnswer implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $limit = 10) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // ✅ Get up to N applicants that have pending answers
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
            info('No applicants with pending answers found.');
            return;
        }

        // ✅ Prepare a temporary in-memory file for CSV
        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, [
            'user_id',
            'applicant_id',
            'question_id',
            'answer_id',
            'job_posting_id',
            'job_posting_title',
            'job_posting_description',
            'job_posting_responsibilities',
            'job_posting_requirements',
            'job_posting_benefits',
            'question',
            'answer',
            'weight'
        ]);

        // ✅ Write CSV rows and track processed answer IDs
        $processedAnswerIds = [];

        foreach ($applicants as $applicant) {
            foreach ($applicant->appliedJobs as $job) {
                foreach ($job->jobPostingAnswers as $answer) {
                    if ($answer->status !== 'pending') continue;

                    $jobPosting = $answer->jobPostingQuestion->jobPosting;

                    fputcsv($handle, [
                        $applicant->user->id ?? 'Unknown',
                        $applicant->id ?? '-',
                        $answer->job_posting_question_id ?? '-',
                        $answer->id ?? '-',
                        $jobPosting->id ?? '-',
                        $this->formatField($jobPosting->title),
                        $this->formatJsonField($jobPosting->description),
                        $this->formatJsonField($jobPosting->responsibilities),
                        $this->formatJsonField($jobPosting->requirements),
                        $this->formatJsonField($jobPosting->benefits),
                        $this->formatField($answer->jobPostingQuestion->question),
                        $this->formatField($answer->answer),
                        $this->formatField($answer->jobPostingQuestion->weight),
                    ]);

                    // Track this answer ID for status update
                    $processedAnswerIds[] = $answer->id;
                }
            }
        }

        // ✅ Save file to storage
        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        $filename = 'applicant_answers_' . now()->format('Ymd_His') . '.csv';
        $path = "exports/$filename";
        Storage::disk('local')->put($path, $csvContent);

        // ✅ Update all processed answers to 'processing' status
        if (!empty($processedAnswerIds)) {
            \App\Models\AppliedJobAnswer::whereIn('id', $processedAnswerIds)
                ->update([
                    'status' => 'processing',
                    'updated_at' => now()
                ]);

            info("✅ Updated " . count($processedAnswerIds) . " answers to 'processing' status");
        }

        info("✅ CSV file generated: storage/app/$path");

        // Dispatch the next job
        dispatch(new SendApplicantAnswerCsv($filename, $processedAnswerIds));
    }

    /**
     * Format JSON field for CSV export
     */
    private function formatJsonField($field): string
    {
        if (empty($field)) {
            return '-';
        }

        // If it's a string, try to decode it
        if (is_string($field)) {
            $decoded = json_decode($field, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $field = $decoded; // Use decoded array
            } else {
                return $field; // Return as-is if not JSON
            }
        }

        // If it's an array, process it
        if (is_array($field)) {
            // Check if it's an array of objects with 'value' key
            $values = [];
            foreach ($field as $item) {
                if (is_array($item) && isset($item['value'])) {
                    $values[] = $item['value'];
                } elseif (is_string($item)) {
                    $values[] = $item;
                }
            }

            return !empty($values) ? implode('; ', $values) : '-';
        }

        return '-';
    }

    /**
     * Format regular field for CSV export (handles any type safely)
     */
    private function formatField($field): string
    {
        if (empty($field)) {
            return '-';
        }

        if (is_array($field)) {
            return json_encode($field);
        }

        return (string) $field;
    }
}
