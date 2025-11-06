<?php

namespace App\Http\Requests\HRMS;

use Illuminate\Foundation\Http\FormRequest;

class ScreeningRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     * Convert question_scores from JSON string to array and format UUIDs
     */
    protected function prepareForValidation(): void
    {
        $screeningResults = $this->input('screening_results', []);

        foreach ($screeningResults as $key => $result) {
            // Format main UUIDs
            if (isset($result['id'])) {
                $screeningResults[$key]['id'] = $this->formatToUuid($result['id']);
            }
            if (isset($result['applicant_id'])) {
                $screeningResults[$key]['applicant_id'] = $this->formatToUuid($result['applicant_id']);
            }
            if (isset($result['job_posting_id'])) {
                $screeningResults[$key]['job_posting_id'] = $this->formatToUuid($result['job_posting_id']);
            }

            // Handle question_scores - convert from JSON string to array and format UUIDs within
            if (isset($result['question_scores'])) {
                if (is_string($result['question_scores'])) {
                    // Try to decode the JSON string
                    $decodedScores = json_decode($result['question_scores'], true);

                    // If decoding was successful, replace the string with the array
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedScores)) {
                        $screeningResults[$key]['question_scores'] = $this->formatQuestionScoresUuids($decodedScores);
                    }
                } elseif (is_array($result['question_scores'])) {
                    // If it's already an array, just format the UUIDs
                    $screeningResults[$key]['question_scores'] = $this->formatQuestionScoresUuids($result['question_scores']);
                }
            }

            // Convert weight_version to integer if it's a string
            if (isset($result['weight_version']) && is_string($result['weight_version'])) {
                $screeningResults[$key]['weight_version'] = (int) $result['weight_version'];
            }
        }
        $this->merge([
            'screening_results' => $screeningResults
        ]);
    }

    /**
     * Format a 32-character hex string to standard UUID format
     */
    private function formatToUuid(string $id): string
    {
        // If it's already in UUID format (contains hyphens), return as is
        if (str_contains($id, '-')) {
            return $id;
        }

        // If it's a 32-character hex string, format it as UUID
        if (strlen($id) === 32 && ctype_xdigit($id)) {
            return sprintf(
                '%s-%s-%s-%s-%s',
                substr($id, 0, 8),
                substr($id, 8, 4),
                substr($id, 12, 4),
                substr($id, 16, 4),
                substr($id, 20, 12)
            );
        }

        // Return as is if it doesn't match expected format
        return $id;
    }

    /**
     * Format UUIDs within question_scores array
     */
    private function formatQuestionScoresUuids(array $questionScores): array
    {
        foreach ($questionScores as $index => $score) {
            if (isset($score['question_id'])) {
                $questionScores[$index]['question_id'] = $this->formatToUuid($score['question_id']);
            }
        }

        return $questionScores;
    }

    /**
     * Expected JSON payload:
     * {
     *   "auth_id": "guest",
     *   "screening_results": [
     *     {
     *       "id": "uuid",
     *       "applicant_id": "uuid",
     *       "job_posting_id": "uuid",
     *       "total_score": float,
     *       "question_scores": [
     *         {
     *           "question_id": "uuid",
     *           "question_score": float,
     *           "competencies_scores": {
     *             "total_competencies_scores": float,
     *             "competency_xxx_score": float,
     *             ...
     *           },
     *           "combined_question_competencies_scores": {
     *             "total_combined_scores": float,
     *             "combined_question_competencies_xxx_score": float,
     *             ...
     *           },
     *           "total_question_score": float
     *         }
     *       ],
     *       "decision": string,
     *       "weight_version": int,
     *       "model_version": string,
     *       "created_at": datetime,
     *       "hr_rating": nullable numeric,
     *       "hr_decision": nullable string,
     *       "hr_notes": nullable string
     *     }
     *   ]
     * }
     */
    public function rules(): array
    {
        return [
            'screening_results' => ['required', 'array', 'min:1'],

            'screening_results.*.id' => ['required', 'uuid'],
            'screening_results.*.applicant_id' => ['required', 'uuid'],
            'screening_results.*.job_posting_id' => ['required', 'uuid'],
            'screening_results.*.total_score' => ['required', 'numeric'],

            'screening_results.*.question_scores' => ['required', 'array', 'min:1'],
            'screening_results.*.question_scores.*.question_id' => ['required', 'uuid'],
            'screening_results.*.question_scores.*.question_score' => ['required', 'numeric'],

            // competencies_scores
            'screening_results.*.question_scores.*.competencies_scores' => ['required', 'array'],
            'screening_results.*.question_scores.*.competencies_scores.total_competencies_scores' => ['required', 'numeric'],
            'screening_results.*.question_scores.*.competencies_scores.*' => [ 'numeric'],


            // combined_question_competencies_scores
            'screening_results.*.question_scores.*.combined_question_competencies_scores' => ['required', 'array'],
            'screening_results.*.question_scores.*.combined_question_competencies_scores.total_combined_scores' => ['required', 'numeric'],
            'screening_results.*.question_scores.*.combined_question_competencies_scores.*' => ['numeric'],

            'screening_results.*.question_scores.*.total_question_score' => ['required', 'numeric'],

            'screening_results.*.decision' => ['required', 'string'],
            'screening_results.*.weight_version' => ['required', 'integer'],
            'screening_results.*.model_version' => ['required', 'string'],
            'screening_results.*.created_at' => ['required', 'date'],

            'screening_results.*.hr_rating' => ['nullable', 'numeric'],
            'screening_results.*.hr_decision' => ['nullable', 'string'],
            'screening_results.*.hr_notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'screening_results.required' => 'The screening_results field is required.',
            'screening_results.array' => 'The screening_results must be an array.',
            'screening_results.*.id.uuid' => 'Each screening result must have a valid UUID for id.',
            'screening_results.*.applicant_id.uuid' => 'Each screening result must have a valid applicant_id (UUID).',
            'screening_results.*.job_posting_id.uuid' => 'Each screening result must have a valid job_posting_id (UUID).',
            'screening_results.*.question_scores.required' => 'Each result must contain question_scores.',
            'screening_results.*.question_scores.array' => 'The question_scores must be an array.',
            'screening_results.*.question_scores.*.question_id.uuid' => 'Each question score must have a valid question_id (UUID).',
        ];
    }
}
