<?php

namespace App\Http\Requests\HRMS;

use Illuminate\Foundation\Http\FormRequest;

class ScreeningRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Expected payload structure:
     * {
     *   "screening_results": [
     *     {
     *       "id": "uuid",
     *       "applicant_id": "uuid",
     *       "job_posting_id": "uuid",
     *       "total_score": float,
     *       "question_scores": [ { "question_id": "uuid", "score": float, "weight": float, "weighted_score": float }, ... ],
     *       "decision": string,
     *       "weight_version": int,
     *       "model_version": string,
     *       "created_at": date-time string,
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

            'screening_results.*.question_scores' => ['required', 'array'],
            'screening_results.*.question_scores.*.question_id' => ['required', 'uuid'],
            'screening_results.*.question_scores.*.score' => ['required', 'numeric'],
            'screening_results.*.question_scores.*.weight' => ['required', 'numeric'],
            'screening_results.*.question_scores.*.weighted_score' => ['required', 'numeric'],

            'screening_results.*.decision' => ['required', 'string'],
            'screening_results.*.weight_version' => ['required', 'integer'],
            'screening_results.*.model_version' => ['required', 'string'],
            'screening_results.*.created_at' => ['required', 'date'],

            'screening_results.*.hr_rating' => ['nullable', 'numeric'],
            'screening_results.*.hr_decision' => ['nullable', 'string'],
            'screening_results.*.hr_notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Custom messages (optional) — keep minimal to provide clearer feedback.
     */
    public function messages(): array
    {
        return [
            'screening_results.required' => 'The screening_results array is required.',
            'screening_results.array' => 'The screening_results must be an array of results.',
            'screening_results.*.id.uuid' => 'Each screening result must include a valid id (UUID).',
            'screening_results.*.applicant_id.uuid' => 'Each screening result must include a valid applicant_id (UUID).',
            'screening_results.*.job_posting_id.uuid' => 'Each screening result must include a valid job_posting_id (UUID).',
        ];
    }
}
