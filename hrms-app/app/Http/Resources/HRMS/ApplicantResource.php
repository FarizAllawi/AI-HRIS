<?php

namespace App\Http\Resources\HRMS;

use App\Http\Resources\MediaResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $latestApplied = null;
        if ($this->relationLoaded('appliedJobs')) {
            $latestApplied = $this->appliedJobs->first(); // limited to 1 in repository for lists
        }
        $job = $latestApplied && $latestApplied->relationLoaded('jobPosting')
            ? $latestApplied->jobPosting
            : null;
        $resumeResource = $this->relationLoaded('resume') && $this->resume
            ? new MediaResource($this->resume)
            : null;

        $appliedJobsWithAnswers = [];
        if ($this->relationLoaded('appliedJobs')) {
            $appliedJobsWithAnswers = $this->appliedJobs->map(function ($aj) use ($request) {
                $job = $aj->relationLoaded('jobPosting') ? $aj->jobPosting : null;
                $answers = [];
                if ($aj->relationLoaded('answers')) {
                    $answers = $aj->answers->map(function ($ans) {
                        $questionText = $ans->relationLoaded('jobPostingQuestion') && $ans->jobPostingQuestion
                            ? ($ans->jobPostingQuestion->question ?? '')
                            : '';
                        return [
                            'question' => $questionText,
                            'answer' => $ans->answer,
                            'score' => (int)($ans->hr_score ?? $ans->ai_score ?? 0),
                        ];
                    })->toArray();
                }
                return [
                    'job' => [
                        'title' => $job->title ?? '',
                        'department' => $job->departments ?? '',
                        'dateApplied' => (string) $aj->created_at,
                        'location' => $job->location ?? '',
                        'code' => (string)($job->id ?? $aj->id),
                    ],
                    'answers' => $answers,
                ];
            })->toArray();
        }

        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'email' => $this->email,
            'phone' => $this->phone,
            'portfolioLink' => $this->portfolio_link,
            'resumeMediaId' => $this->resume_media_id,
            'createdAt' => $this->created_at,
            'user' => new UserResource($this->whenLoaded('user')),
            'resume' => $resumeResource,

            // Flattened fields for frontend ApplicantRecord shape
            'fullName' => $this->whenLoaded('user', fn () => $this->user->name, ''),
            'applicationDate' => $latestApplied?->created_at ? (string) $latestApplied->created_at : '',
            'positionTitle' => $job?->title ?? '',
            'positionCode' => null,
            'interviewStatus' => 'tbd',
            'interviewDateTime' => null,
            'interviewType' => 'tbd',
            'interviewLocationOrLink' => null,
            'interviewers' => [],
            'candidateResponse' => null,
            'contactEmail' => $this->email ?? $this->whenLoaded('user', fn () => $this->user->email),
            'contactPhone' => $this->phone,
            'profileUrl' => null,
            'resumeUrl' => $resumeResource?->toArray($request)['url'] ?? null,
            'applicationStatus' => 'new',
            'feedbackStatus' => 'n/a',
            'resumeScore' => null,
            'referralSource' => null,

            // Detail tabs data
            'appliedJobsWithAnswers' => $appliedJobsWithAnswers,
        ];
    }
}
