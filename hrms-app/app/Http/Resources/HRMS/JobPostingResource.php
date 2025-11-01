<?php

namespace App\Http\Resources\HRMS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingResource extends JsonResource
{
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
            'qualifications' => $this->qualifications,
            'benefits' => $this->benefits,
            'required_skills' => $this->required_skills,
            'preferred_skills' => $this->preferred_skills,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    private function transformArrayField($field): array
    {
        if (empty($field)) {
            return [];
        }
        if (is_string($field)) {
            $decoded = json_decode($field, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $field = $decoded;
            } else {
                return [['value' => $field]];
            }
        }
        if (is_array($field)) {
            return array_map(function ($item) {
                if (is_array($item) && isset($item['value'])) {
                    return $item;
                } elseif (is_string($item)) {
                    return ['value' => $item];
                } else {
                    return ['value' => (string)$item];
                }
            }, $field);
        }
        return [];
    }

    private function transformQuestions($questions): array
    {
        if (empty($questions)) {
            return [];
        }
        if (is_iterable($questions)) {
            return collect($questions)->map(function ($question) {
                return [
                    'question' => $question['question'] ?? '',
                    'description' => $question['description'] ?? '',
                    'weight' => (string)($question['weight'] ?? ''),
                ];
            })->toArray();
        }
        return [];
    }
}
