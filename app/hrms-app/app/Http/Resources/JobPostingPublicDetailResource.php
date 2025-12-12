<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingPublicDetailResource extends JsonResource
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
            'type' => $this->type,
            'salary' => $this->salary,
            'benefits' => $this->benefits,
            'requirements' => $this->requirements,
            'responsibilities' => $this->responsibilities,
            'qualifications' => $this->qualifications,
            'required_skills' => $this->required_skills,
            'preferred_skills' => $this->preferred_skills,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'questions' => $this->whenLoaded('questions', function () {
                return $this->questions->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'question' => $q->question,
                        'description' => $q->description,
                    ];
                });
            }),
        ];
    }

    private function formatArray($field): array
    {
        if (empty($field)) {
            return [];
        }
        return collect($field)
            ->map(function ($item) {
                if (is_array($item) && isset($item['value'])) {
                    return $item;
                }
                return ['value' => is_array($item) ? json_encode($item) : (string) $item];
            })
            ->toArray();
    }
}
