<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Http\Requests\HRMS\JobPostingRequest;
use App\Http\Resources\HRMS\FormJobPostingResource;
use App\Http\Resources\HRMS\JobPostingResource;
use App\Http\Resources\HRMS\JobPostingDetailResource;
use App\Models\JobPosting;
use App\Repositories\JobPosting\JobPostingRepositoryInterface;
use App\Repositories\JobPostingQuestions\JobPostingQuestionsRepositoryInterface;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class JobPostingController extends Controller
{
    public function __construct(
        protected JobPostingRepositoryInterface $jobPosting,
        protected JobPostingQuestionsRepositoryInterface $jobPostingQuestions
    ){}

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $jobPostings = $this->jobPosting->all();
        return Inertia::render('HRMS/job-posting/index', [
            'jobPostings' => JobPostingResource::collection($jobPostings)
        ]);
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
    public function store(JobPostingRequest $request)
    {
        try {
            $data = $request->validated();
            $this->jobPosting->create($data);

            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to create job posting', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'general' => 'Failed to create job posting. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(JobPosting $jobPosting): Response
    {
        return Inertia::render('HRMS/job-posting/detail', [
            'jobPosting' => new JobPostingDetailResource($jobPosting),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobPosting $jobPosting)
    {
        $jobPosting->load('questions');
        $jobPostingResource = new FormJobPostingResource($jobPosting);

        return Inertia::render('HRMS/job-posting/action', [
            'jobPosting' => $jobPostingResource->toFormData()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(JobPostingRequest $request, JobPosting $jobPosting)
    {
        try {
            $data = $request->validated();
            $this->jobPosting->update($jobPosting->id, $data);

            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to update job posting', [
                'job_posting_id' => $jobPosting->id,
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'general' => 'Failed to update job posting. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Archive the specified resource.
     */
    public function archive(JobPosting $jobPosting)
    {
        try {
            $this->jobPosting->updateStatus($jobPosting['id'], 'archived');
            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to archive job posting', [
                'job_posting_id' => $jobPosting['id'],
                'message' => $e->getMessage(),
            ]);
            return back()->withErrors(['general' => 'Failed to archive job posting.']);
        }
    }

    /**
     * Unpublish the specified resource.
     */
    public function unpublish(JobPosting $jobPosting)
    {
        try {
            $this->jobPosting->updateStatus($jobPosting['id'], 'unpublish');
            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to unpublish job posting', [
                'job_posting_id' => $jobPosting['id'],
                'message' => $e->getMessage(),
            ]);
            return back()->withErrors(['general' => 'Failed to unpublish job posting.']);
        }
    }

    /**
     * Publish the specified resource.
     */
    public function publish(JobPosting $jobPosting)
    {
        try {
            $this->jobPosting->updateStatus($jobPosting['id'], 'published');
            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to publish job posting', [
                'job_posting_id' => $jobPosting['id'],
                'message' => $e->getMessage(),
            ]);
            return back()->withErrors(['general' => 'Failed to publish job posting.']);
        }
    }

    /**
     * Unarchive the specified resource.
     */
    public function unarchive(JobPosting $jobPosting)
    {
        try {
            $this->jobPosting->updateStatus($jobPosting['id'], 'draft');
            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to unarchive job posting', [
                'job_posting_id' => $jobPosting['id'],
                'message' => $e->getMessage(),
            ]);
            return back()->withErrors(['general' => 'Failed to unarchive job posting.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobPosting $jobPosting)
    {
        try {
            $this->jobPosting->delete($jobPosting->id);

            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            Log::error('Failed to delete job posting', [
                'job_posting_id' => $jobPosting->id,
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return Redirect::route('job-posting.index');
        }
    }
}
