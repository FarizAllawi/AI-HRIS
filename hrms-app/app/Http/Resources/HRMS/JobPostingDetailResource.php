<?php

namespace App\Http\Resources\HRMS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class JobPostingDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $appliedJobs = $this->appliedJobs()
            ->with(['applicant.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $applicants = $this->transformApplicants($appliedJobs);
        $rankings = $this->generateRankings($applicants, $appliedJobs);
        $aiRankings = $this->generateAiRankings($rankings);
        $aiProgress = $this->calculateAiProgress($applicants);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'dateCreated' => $this->created_at->toDateString(),
            'publishedStatus' => $this->status,
            'description' => $this->description,
            'location' => $this->location,
            'department' => $this->departments,
            'employmentType' => $this->type,
            'salary' => $this->salary,
            'requirements' => $this->formatArrayField($this->requirements),
            'responsibilities' => $this->formatArrayField($this->responsibilities),
            'benefits' => $this->formatArrayField($this->benefits),
            'applicants' => $applicants,
            'rankings' => $rankings,
            'aiRankings' => $aiRankings,
            'aiProgress' => $aiProgress,
            'statistics' => $this->generateStatistics($applicants),
        ];
    }

    private function transformApplicants(Collection $appliedJobs): array
    {
        return $appliedJobs->map(function ($appliedJob) {
            $applicant = $appliedJob->applicant;
            $user = $applicant->user;

            $status = $this->determineApplicantStatus($appliedJob);

            return [
                'id' => $appliedJob->id,
                'applicantId' => $applicant->id,
                'fullName' => $user->name,
                'email' => $applicant->email ?? $user->email,
                'phone' => $applicant->phone,
                'applicationDate' => $appliedJob->created_at->toDateString(),
                'applicationDateTime' => $appliedJob->created_at->toISOString(),
                'status' => $status,
                'resumeScore' => $appliedJob->ai_screening_score,
                'aiScore' => $appliedJob->ai_screening_score,
                'hrScore' => $appliedJob->hr_screening_score,
                'portfolioLink' => $applicant->portfolio_link,
                'resumeFile' => $applicant->resume_file,
                'profileUrl' => url("/HRMS/applicant/{$appliedJob->id}"),
                'avatarUrl' => "https://ui-avatars.com/api/?name=" . urlencode($user->name) . "&background=random&size=100",
                'daysAgo' => $appliedJob->created_at->diffInDays(now()),
                'isNew' => $appliedJob->created_at->isToday(),
            ];
        })->toArray();
    }

    private function determineApplicantStatus($appliedJob): string
    {
        if ($appliedJob->hr_screening_score !== null) {
            return $appliedJob->hr_screening_score >= 70 ? 'approved' : 'rejected';
        }
        if ($appliedJob->ai_screening_score !== null) {
            return 'in_review';
        }
        return 'new';
    }

    private function generateRankings(array $applicants, Collection $appliedJobs): array
    {
        return collect($applicants)
            ->filter(function ($a) {
                return $a['status'] !== 'new' && $a['resumeScore'] !== null;
            })
            ->sortByDesc('resumeScore')
            ->values()
            ->map(function ($a, $idx) {
                $a['rank'] = $idx + 1;
                $a['aiScore'] = (int)($a['resumeScore'] ?? 0);
                $a['hrScore'] = (int)($a['hrScore'] ?? 0);
                $a['finalScore'] = $a['hrScore'] > 0
                    ? (int) round(($a['aiScore'] + $a['hrScore']) / 2)
                    : $a['aiScore'];
                return $a;
            })->toArray();
    }

    private function generateAiRankings(array $rankings): array
    {
        return collect($rankings)
            ->sortByDesc('aiScore')
            ->values()
            ->map(function ($a, $idx) {
                $a['aiRank'] = $idx + 1;
                return $a;
            })->toArray();
    }

    private function calculateAiProgress(array $applicants): array
    {
        $total = count($applicants);
        $aiScreened = collect($applicants)->filter(function ($a) {
            return isset($a['resumeScore']) && $a['resumeScore'] !== null;
        })->count();

        $inReview = collect($applicants)->filter(function ($a) {
            return $a['status'] === 'in_review';
        })->count();

        $approved = collect($applicants)->filter(function ($a) {
            return $a['status'] === 'approved';
        })->count();

        $rejected = collect($applicants)->filter(function ($a) {
            return $a['status'] === 'rejected';
        })->count();

        return [
            'totalApplicants' => $total,
            'aiScreenedCount' => $aiScreened,
            'aiScreeningCurrent' => $inReview,
            'pendingScreening' => $total - $aiScreened,
            'approvedCount' => $approved,
            'rejectedCount' => $rejected,
            'screeningProgress' => $total > 0 ? round(($aiScreened / $total) * 100, 1) : 0,
        ];
    }

    private function generateStatistics(array $applicants): array
    {
        $scores = collect($applicants)
            ->whereNotNull('resumeScore')
            ->pluck('resumeScore');

        $today = collect($applicants)
            ->where('isNew', true)
            ->count();

        $thisWeek = collect($applicants)
            ->where('daysAgo', '<=', 7)
            ->count();

        return [
            'averageScore' => $scores->count() > 0 ? round($scores->average(), 1) : 0,
            'highestScore' => $scores->count() > 0 ? $scores->max() : 0,
            'lowestScore' => $scores->count() > 0 ? $scores->min() : 0,
            'applicationsToday' => $today,
            'applicationsThisWeek' => $thisWeek,
            'totalApplications' => count($applicants),
            'averageScoreText' => $scores->count() > 0 ? round($scores->average(), 1) . '%' : 'N/A',
        ];
    }

    private function formatArrayField($field): array
    {
        if (is_null($field)) {
            return [];
        }
        return collect($field)
            ->map(function ($item) {
                return is_array($item) ? ($item['value'] ?? '') : $item;
            })
            ->filter()
            ->toArray();
    }
}
