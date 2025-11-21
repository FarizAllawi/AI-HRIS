<?php

namespace App\Http\Resources\HRMS;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class JobPostingDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $questions = $this->questions()->get();
        $appliedJobs = $this->appliedJobs()
            ->with(['applicant.user', 'jobPostingAnswers']) // Added jobPostingAnswers
            ->orderBy('created_at', 'desc')
            ->get();

        $applicants = $this->transformApplicants($appliedJobs);
        $rankings = $this->generateRankings($applicants, $appliedJobs);
        $aiRankings = $this->generateAiRankings($rankings);
        $aiProgress = $this->calculateAiProgress($appliedJobs); // Changed to pass appliedJobs

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
            'requirements' => $this->requirements,
            'responsibilities' => $this->responsibilities,
            'qualifications' => $this->qualifications,
            'required_skills' => $this->required_skills,
            'preferred_skills' => $this->preferred_skills,
            'benefits' => $this->benefits,
            'questions' => $questions,
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
                'aiScore' => $appliedJob->ai_screening_score,
                'hrScore' => $appliedJob->hr_screening_score,
                'portfolioLink' => $applicant->portfolio_link,
                'resumeFile' => $applicant->resume_file,
                'profileUrl' => url("/HRMS/applicant/{$appliedJob->id}"),
                'avatarUrl' => "https://ui-avatars.com/api/?name=" . urlencode($user->name) . "&background=random&size=100",
                'daysAgo' => $appliedJob->created_at->diffInDays(now()),
                'isNew' => $appliedJob->created_at->isToday(),
                'answersStatus' => $this->getAnswersStatus($appliedJob), // Added answers status
            ];
        })->toArray();
    }

    private function getAnswersStatus($appliedJob): array
    {
        $answers = $appliedJob->jobPostingAnswers;

        if ($answers->isEmpty()) {
            return [
                'total' => 0,
                'completed' => 0,
                'pending' => 0,
                'processing' => 0,
                'failed' => 0,
                'all_completed' => false
            ];
        }

        $statusCounts = $answers->groupBy('status')->map->count();

        return [
            'total' => $answers->count(),
            'completed' => $statusCounts->get('completed', 0),
            'pending' => $statusCounts->get('pending', 0),
            'processing' => $statusCounts->get('processing', 0),
            'failed' => $statusCounts->get('failed', 0),
            'all_completed' => $statusCounts->get('completed', 0) === $answers->count()
        ];
    }

    private function determineApplicantStatus($appliedJob): string
    {
        if ($appliedJob->hr_screening_score !== null) {
            return $appliedJob->hr_screening_score >= 70 ? 'approved' : 'rejected';
        }

        // Check if all answers are completed for AI screening
        $answersStatus = $this->getAnswersStatus($appliedJob);

        if ($answersStatus['all_completed'] && $appliedJob->ai_screening_score !== null) {
            return 'in_review';
        }

        // If answers are still being processed
        if ($answersStatus['processing'] > 0 || $answersStatus['pending'] > 0) {
            return 'processing';
        }

        // If all answers failed
        if ($answersStatus['failed'] > 0 && $answersStatus['failed'] === $answersStatus['total']) {
            return 'failed';
        }

        return 'new';
    }

    private function generateRankings(array $applicants, Collection $appliedJobs): array
    {
        return collect($applicants)
            ->filter(function ($a) {
                return $a['status'] !== 'new' && $a['status'] !== 'processing' && $a['aiScore'] !== null;
            })
            ->sortByDesc('aiScore')
            ->values()
            ->map(function ($a, $idx) {
                $a['rank'] = $idx + 1;
                $a['aiScore'] = (float)($a['aiScore'] ?? 0);
                $a['hrScore'] = (float)($a['hrScore'] ?? 0);
                $a['finalScore'] = $a['hrScore'] > 0
                    ? (float) round(($a['aiScore'] + $a['hrScore']) / 2)
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

    private function calculateAiProgress(Collection $appliedJobs): array
    {
        $total = $appliedJobs->count();

        $statusCounts = [
            'completed' => 0,
            'processing' => 0,
            'pending' => 0,
            'failed' => 0,
            'in_review' => 0,
            'approved' => 0,
            'rejected' => 0,
            'new' => 0,
        ];

        foreach ($appliedJobs as $appliedJob) {
            $status = $this->determineApplicantStatus($appliedJob);
            $statusCounts[$status]++;
        }

        $aiScreened = $statusCounts['in_review'] + $statusCounts['approved'] + $statusCounts['rejected'];
        $aiScreeningCurrent = $statusCounts['processing'];

        return [
            'totalApplicants' => $total,
            'aiScreenedCount' => $aiScreened,
            'aiScreeningCurrent' => $aiScreeningCurrent,
            'pendingScreening' => $statusCounts['pending'] + $statusCounts['new'],
            'approvedCount' => $statusCounts['approved'],
            'rejectedCount' => $statusCounts['rejected'],
            'failedCount' => $statusCounts['failed'],
            'inReviewCount' => $statusCounts['in_review'],
            'processingCount' => $statusCounts['processing'],
            'screeningProgress' => $total > 0 ? round(($aiScreened / $total) * 100, 1) : 0,
            'statusBreakdown' => $statusCounts, // Added for detailed breakdown
        ];
    }

    private function generateStatistics(array $applicants): array
    {
        $scores = collect($applicants)
            ->whereNotNull('aiScore')
            ->pluck('aiScore');

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
