<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'departments' => $this->departments,
            'salary' => $this->salary,
            'type' => $this->type,
            'status' => $this->status,
            'totalApplicants' => $this->applied_jobs_count ?? 0,
            'requirements' => $this->requirements,
            'responsibilities' => $this->responsibilities,
            'benefits' => $this->benefits,
            'questions' => $this->transformQuestions($this->questions),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Transform array field to ensure proper structure for form
     *
     * @param mixed $field
     * @return array
     */
    private function transformArrayField($field): array
    {
        if (empty($field)) {
            return [];
        }

        // If it's a JSON string, decode it
        if (is_string($field)) {
            $decoded = json_decode($field, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $field = $decoded;
            } else {
                // If JSON decode fails, treat as single item
                return [['value' => $field]];
            }
        }

        // If it's already an array, ensure proper structure
        if (is_array($field)) {
            return array_map(function ($item) {
                if (is_array($item) && isset($item['value'])) {
                    // Already has correct structure
                    return $item;
                } elseif (is_string($item)) {
                    // Convert string to object with value property
                    return ['value' => $item];
                } else {
                    // Convert other types to string with value property
                    return ['value' => (string)$item];
                }
            }, $field);
        }

        // Fallback: return empty array
        return [];
    }

    /**
     * Transform questions to match form structure
     *
     * @param mixed $questions
     * @return array
     */
    private function transformQuestions($questions): array
    {
        if (empty($questions)) {
            return [];
        }

        // If questions is a collection or array
        if (is_iterable($questions)) {
            return collect($questions)->map(function ($question) {
                return [
                    'question' => $question['question'] ?? '', // Note: API uses 'questions' but form expects 'question'
                    'description' => $question['description'] ?? '', // Add empty description as fallback
                    'weight' => (string)($question['weight'] ?? ''),
                ];
            })->toArray();
        }

        return [];
    }


}
