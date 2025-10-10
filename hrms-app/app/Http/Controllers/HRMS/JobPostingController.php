<?php

namespace App\Http\Controllers\HRMS;

use App\Repositories\JobPosting\JobPostingRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobPostingController extends Controller
{

    public function __construct(
        protected JobPostingRepositoryInterface $jobPosting
    ){}
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('HRMS/job-posting/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('HRMS/job-posting/action');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        // Demo payload for UI preview; replace with repository fetch
        // Build demo applicants
        $applicants = [
            [
                'id' => 'A-50001',
                'fullName' => 'Alice Johnson',
                'applicationDate' => now()->subDays(6)->toDateString(),
                'status' => 'in_review',
                'resumeScore' => 86,
                'profileUrl' => url("/HRMS/applicant/A-50001"),
                'avatarUrl' => 'https://i.pravatar.cc/100?img=1',
            ],
            [
                'id' => 'A-50002',
                'fullName' => 'David Kim',
                'applicationDate' => now()->subDays(3)->toDateString(),
                'status' => 'new',
                'resumeScore' => 78,
                'profileUrl' => url("/HRMS/applicant/A-50002"),
                'avatarUrl' => 'https://i.pravatar.cc/100?img=2',
            ],
            [
                'id' => 'A-50003',
                'fullName' => 'Maria Garcia',
                'applicationDate' => now()->subDays(1)->toDateString(),
                'status' => 'in_review',
                'resumeScore' => 92,
                'profileUrl' => url("/HRMS/applicant/A-50003"),
                'avatarUrl' => 'https://i.pravatar.cc/100?img=3',
            ],
            [
                'id' => 'A-50004',
                'fullName' => 'John Smith',
                'applicationDate' => now()->toDateString(),
                'status' => 'new',
                'resumeScore' => 74,
                'profileUrl' => url("/HRMS/applicant/A-50004"),
                'avatarUrl' => 'https://i.pravatar.cc/100?img=4',
            ],
        ];

        // Rankings by resumeScore desc
        $rankings = collect($applicants)
            ->filter(function ($a) {
                return ($a['status'] ?? null) !== 'new';
            })
            ->sortByDesc('resumeScore')
            ->values()
            ->map(function ($a, $idx) {
                $a['rank'] = $idx + 1;
                // Demo: derive AI and HR scores and compute a final blended score
                $ai = (int)($a['resumeScore'] ?? 0);
                $hr = max(0, min(100, $ai + (($idx % 2 === 0) ? 3 : -5)));
                $final = (int) round(($ai + $hr) / 2);
                $a['aiScore'] = $ai;
                $a['hrScore'] = $hr;
                $a['finalScore'] = $final;
                return $a;
            })->all();

        // AI-only rankings (exclude "new", sort by AI score)
        $aiRankings = collect($rankings)
            ->sortByDesc('aiScore')
            ->values()
            ->map(function ($a, $idx) {
                $a['aiRank'] = $idx + 1;
                return $a;
            })->all();

        $posting = [
            'id' => $id,
            'title' => 'Senior Software Engineer',
            'dateCreated' => now()->toDateString(),
            'publishedStatus' => 'published',
            'description' => 'We are looking for a Senior Software Engineer to join our team.',
            'location' => 'Jakarta',
            'department' => 'Engineering',
            'employmentType' => 'Full-time',
            'requirements' => [
                '5+ years of experience in software development',
                'Experience with Laravel and React',
                'Familiarity with REST APIs and CI/CD',
            ],
            'responsibilities' => [
                'Design and implement scalable systems',
                'Collaborate with cross-functional teams',
                'Review code and mentor teammates',
            ],
            'applicants' => $applicants,
            'rankings' => $rankings,
            'aiRankings' => $aiRankings,
            'aiProgress' => [
                'aiScreenedCount' => collect($applicants)->filter(function ($a) { return isset($a['resumeScore']); })->count(),
                'aiScreeningCurrent' => collect($applicants)->filter(function ($a) { return isset($a['resumeScore']) && ($a['status'] ?? null) === 'in_review'; })->count(),
                'totalApplicants' => count($applicants),
            ],
        ];

        return Inertia::render('HRMS/job-posting/detail', [
            'jobPosting' => $posting,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobPosting $jobPosting)
    {
        return Inertia::render('HRMS/job-posting/action');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobPosting $jobPosting)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobPosting $jobPosting)
    {
        //
    }
}
