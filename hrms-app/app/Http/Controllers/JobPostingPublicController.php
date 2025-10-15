<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\AppliedJob;
use App\Models\AppliedJobAnswer;
use App\Models\JobPosting;
use App\Repositories\JobPosting\JobPostingRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JobPostingPublicController extends Controller
{
    protected JobPostingRepositoryInterface $jobPostingRepository;

    public function __construct(JobPostingRepositoryInterface $jobPostingRepository)
    {
        $this->jobPostingRepository = $jobPostingRepository;
    }

    /**
     * Display a listing of published job postings.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'status' => 'published',
            'title' => $request->get('search'),
        ];

        $jobPostings = $this->jobPostingRepository->all($filters);

        // Format job postings for the frontend
        $formattedJobPostings = $jobPostings->map(function ($jobPosting) {
            return [
                'id' => $jobPosting->id,
                'title' => $jobPosting->title,
                'description' => $jobPosting->description,
                'location' => $jobPosting->location,
                'departments' => $jobPosting->departments,
                'type' => $jobPosting->type,
                'salary' => $jobPosting->salary,
                'benefits' => $jobPosting->benefits,
                'requirements' => $jobPosting->requirements,
                'responsibilities' => $jobPosting->responsibilities,
                'created_at' => $jobPosting->created_at,
                'updated_at' => $jobPosting->updated_at,
            ];
        });

        return Inertia::render('job-posting', [
            'jobPostings' => $formattedJobPostings,
            'filters' => $filters,
        ]);
    }

    /**
     * Display the specified job posting with questions.
     */
    public function show(JobPosting $jobPosting): Response
    {
        $jobPosting = $jobPosting->with('questions')
            ->where('status', 'published')->first();

        $formattedJobPosting = [
            'id' => $jobPosting->id,
            'title' => $jobPosting->title,
            'description' => $jobPosting->description,
            'location' => $jobPosting->location,
            'departments' => $jobPosting->departments,
            'type' => $jobPosting->type,
            'salary' => $jobPosting->salary,
            'benefits' => $jobPosting->benefits,
            'requirements' => $jobPosting->requirements,
            'responsibilities' => $jobPosting->responsibilities,
            'created_at' => $jobPosting->created_at,
            'updated_at' => $jobPosting->updated_at,
            'questions' => $jobPosting->questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    'question' => $question->question,
                    'description' => $question->description,
                    'weight' => $question->weight,
                ];
            }),
        ];

        return Inertia::render('job-posting-detail', [
            'jobPosting' => $formattedJobPosting,
        ]);
    }

    /**
     * Submit an application for a job posting.
     */
    public function apply(Request $request, string $id)
    {
        $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'portfolio_link' => 'nullable|url',
            'resume_file' => 'required|file|mimes:pdf,doc,docx|max:10240', // 10MB max
            'answers' => 'nullable|array',
            'answers.*' => 'nullable|string',
        ]);

        $jobPosting = JobPosting::with('questions')
            ->where('status', 'published')
            ->findOrFail($id);

        $user = Auth::user();
        if (!$user) {
            return redirect()->route('register');
        }

        return DB::transaction(function () use ($request, $jobPosting, $user) {
            // Create or update applicant profile
            $applicant = Applicant::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'portfolio_link' => $request->portfolio_link,
                    'resume_file' => $this->storeResumeFile($request->file('resume_file')),
                ]
            );

            // Check if already applied
            $existingApplication = AppliedJob::where([
                'job_posting_id' => $jobPosting->id,
                'applicant_id' => $applicant->id,
            ])->first();

            if ($existingApplication) {
                return back()->withErrors(['application' => 'You have already applied for this position.']);
            }

            // Create application
            $appliedJob = AppliedJob::create([
                'job_posting_id' => $jobPosting->id,
                'applicant_id' => $applicant->id,
                'ai_screening_score' => null,
                'hr_screening_score' => null,
            ]);

            // Save answers to job posting questions
            if ($request->answers) {
                foreach ($request->answers as $questionId => $answer) {
                    if (!empty($answer)) {
                        AppliedJobAnswer::create([
                            'applied_job_id' => $appliedJob->id,
                            'job_posting_question_id' => $questionId,
                            'answer' => $answer,
                        ]);
                    }
                }
            }

            return redirect()->back()->with('success', 'Your application has been submitted successfully!');
        });
    }

    /**
     * Store the uploaded resume file.
     */
    private function storeResumeFile($file): string
    {
        $filename = time() . '_' . $file->getClientOriginalName();
        return $file->storeAs('resumes', $filename, 'public');
    }
}
