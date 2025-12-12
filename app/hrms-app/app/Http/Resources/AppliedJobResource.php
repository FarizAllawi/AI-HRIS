<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppliedJobResource extends JsonResource
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
            'created_at' => $this->created_at,
            'ai_screening_score' => $this->ai_screening_score,
            'hr_screening_score' => $this->hr_screening_score,
            'job' => [
                'id' => $this->whenLoaded('jobPosting', fn () => $this->jobPosting->id),
                'title' => $this->whenLoaded('jobPosting', fn () => $this->jobPosting->title),
                'location' => $this->whenLoaded('jobPosting', fn () => $this->jobPosting->location),
                'type' => $this->whenLoaded('jobPosting', fn () => $this->jobPosting->type),
                'status' => $this->whenLoaded('jobPosting', fn () => $this->jobPosting->status),
            ],
        ];
    }
}
