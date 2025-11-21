<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
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
            'userId' => $this->user_id,
            'email' => $this->email,
            'phone' => $this->phone,
            'portfolioLink' => $this->portfolio_link,
            'resumeMediaId' => $this->resume_media_id,
            'createdAt' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'resume' => new MediaResource($this->whenLoaded('resume')),
        ];
    }
}
