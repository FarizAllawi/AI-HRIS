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
     *   "screening_result": [
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
            'screening_result' => ['required', 'array', 'min:1'],

            'screening_result.*.id' => ['required', 'uuid'],
            'screening_result.*.applicant_id' => ['required', 'uuid'],
            'screening_result.*.job_posting_id' => ['required', 'uuid'],
            'screening_result.*.total_score' => ['required', 'numeric'],

            'screening_result.*.question_scores' => ['required', 'array'],
            'screening_result.*.question_scores.*.question_id' => ['required', 'uuid'],
            'screening_result.*.question_scores.*.score' => ['required', 'numeric'],
            'screening_result.*.question_scores.*.weight' => ['required', 'numeric'],
            'screening_result.*.question_scores.*.weighted_score' => ['required', 'numeric'],

            'screening_result.*.decision' => ['required', 'string'],
            'screening_result.*.weight_version' => ['required', 'integer'],
            'screening_result.*.model_version' => ['required', 'string'],
            'screening_result.*.created_at' => ['required', 'date'],

            'screening_result.*.hr_rating' => ['nullable', 'numeric'],
            'screening_result.*.hr_decision' => ['nullable', 'string'],
            'screening_result.*.hr_notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Custom messages (optional) — keep minimal to provide clearer feedback.
     */
    public function messages(): array
    {
        return [
            'screening_result.required' => 'The screening_result array is required.',
            'screening_result.array' => 'The screening_result must be an array of results.',
            'screening_result.*.id.uuid' => 'Each screening result must include a valid id (UUID).',
            'screening_result.*.applicant_id.uuid' => 'Each screening result must include a valid applicant_id (UUID).',
            'screening_result.*.job_posting_id.uuid' => 'Each screening result must include a valid job_posting_id (UUID).',
        ];
    }
}
