<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApplicantResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Applicant;
use App\Models\AppliedJob;
use App\Models\JobPosting;
use App\Repositories\JobPosting\JobPostingRepositoryInterface;
use App\Repositories\ApplyJob\ApplyJobRepositoryInterface;
use App\Repositories\Applicant\ApplicantRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\ApplyJobRequest;
use App\Http\Requests\JobPostingIndexRequest;
use App\Http\Requests\UpdateMyProfileRequest;
use App\Http\Resources\JobPostingResource;
use App\Http\Resources\JobPostingPublicDetailResource;
use App\Http\Resources\AppliedJobResource;

class JobPostingPublicController extends Controller
{
    public function __construct(
        protected JobPostingRepositoryInterface $jobPostingRepository,
        protected ApplyJobRepositoryInterface $applyJobRepository,
        protected ApplicantRepositoryInterface $applicantRepository,
    ) {}

    /**
     * Display a listing of published job postings.
     */
    public function index(JobPostingIndexRequest $request): Response
    {
        $jobPostings = $this->jobPostingRepository->all($request->filters());

        return Inertia::render('job-posting', [
            'jobPostings' => JobPostingResource::collection($jobPostings),
            'filters' => $request->filters(),
        ]);
    }

    /**
     * Display the specified job posting
     */
    public function show(JobPosting $jobPosting): Response
    {
        $jobPosting = $jobPosting->where('status', 'published')->first();
        return Inertia::render('job-posting-detail', [
            'jobPosting' => new JobPostingPublicDetailResource($jobPosting),
        ]);
    }

    /**
     * Display the specified job posting questions
     */
    public function apply(JobPosting $jobPosting): Response
    {
        $user = Auth::user()->load('applicant.resume',);
        $jobPosting = $jobPosting->with('questions')
            ->where('status', 'published')
            ->firstOrFail();
        return Inertia::render('job-posting-apply', [
            'jobPosting' => new JobPostingPublicDetailResource($jobPosting),
            'user' => new UserResource($user)
        ]);
    }

    /**
     * Submit an application for a job posting.
     */
    public function postApply(ApplyJobRequest $request, JobPosting $jobPosting)
    {
        $jobPosting = $jobPosting->with('questions')
            ->where('status', 'published')
            ->firstOrFail();

        $user = Auth::user()->load('applicant');

        if (!$user->applicant->id) {
            return redirect()->route('register');
        }

        try {
            $this->applyJobRepository->apply($jobPosting, $user, $request->validated());
            return Redirect::route('job-posting-public.my-applications');
        } catch (\Exception $e) {
            return back()->withErrors(['application' => $e->getMessage()]);
        }
    }

    /**
     * List applications of the authenticated applicant.
     */
    public function myApplications(Request $request): Response
    {
        $user = Auth::user();

        $applicant = Applicant::with(['user', 'resume'])->where('user_id', $user->id)->first();

        $applications = collect();
        if ($applicant) {
            $applications = AppliedJob::with('jobPosting')
                ->where('applicant_id', $applicant->id)
                ->orderByDesc('created_at')
                ->get();
        }

        return Inertia::render('my-applications', [
            'applications' => AppliedJobResource::collection($applications),
            'applicant' => new ApplicantResource($applicant)
        ]);
    }

    /**
     * Update the authenticated applicant profile.
     */
    public function updateMyProfile(UpdateMyProfileRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $this->applicantRepository->updateProfile($user, $request->validated(), $request->file('resumeFile'));
        return back()->with('success', 'Profile updated successfully.');
    }
}
