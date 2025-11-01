<?php

namespace App\Http\Resources\HRMS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormJobPostingResource extends JsonResource
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
            'requirements' => $this->requirements,
            'responsibilities' => $this->responsibilities,
            'benefits' => $this->benefits,
            'questions' => $this->transformQuestions($this->questions),
        ];
    }

    public function toFormData(): array
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
            'requirements' => $this->requirements,
            'responsibilities' => $this->responsibilities,
            'qualifications' => $this->qualifications,
            'required_skills' =>$this->required_skills,
            'preferred_skills' => $this->preferred_skills,
            'benefits' => $this->benefits,
            'questions' => $this->transformQuestions($this->questions),
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
                    'id' => $question->id ?? null,
                    'question' => $question['question'] ?? '',
                    'description' => $question['description'] ?? '',
                    'weight' => (string)($question['weight'] ?? ''),
                    'mapped_competencies' => $question['mapped_competencies'] ?? [],
                ];
            })->toArray();
        }
        return [];
    }
}
