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
use Inertia\Inertia;
use Inertia\Response;

class JobPostingController extends Controller
{

    public function __construct(
        protected JobPostingRepositoryInterface $jobPosting,
        protected  JobPostingQuestionsRepositoryInterface $jobPostingQuestions
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
            // Use repository to store
            $data = $request->validated();
            $jobPosting = $this->jobPosting->create($data);

            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
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
        // Fetch job posting from database
        return Inertia::render('HRMS/job-posting/detail', [
            'jobPosting' => new JobPostingDetailResource($jobPosting),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobPosting $jobPosting)
    {
        // Load the job posting with its questions
        $jobPosting->load('questions');

        // Use form-specific resource to transform data for the edit form
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
            // Use repository to update
            $data = $request->validated();
            $this->jobPosting->update($jobPosting->id, $data);

            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            return back()->withErrors([
                'general' => 'Failed to update job posting. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Archive the specified resource.
     */
    public function archived(JobPosting $jobPosting)
    {
        // Use repository to update status to archived
        $this->jobPosting->updateStatus($jobPosting->id, 'archived');

        return Redirect::route('job-posting.index');
    }

    /**
     * Unpublish the specified resource.
     */
    public function unpublish(JobPosting $jobPosting)
    {
        // Use repository to update status to unpublish
        $this->jobPosting->updateStatus($jobPosting->id, 'unpublish');

        return Redirect::route('job-posting.index');
    }

    /**
     * Publish the specified resource.
     */
    public function publish(JobPosting $jobPosting)
    {
        // Use repository to update status to published
        $this->jobPosting->updateStatus($jobPosting->id, 'published');

        return Redirect::route('job-posting.index');
    }

    /**
     * Unarchive the specified resource.
     */
    public function unarchive(JobPosting $jobPosting)
    {
        // Use repository to update status to draft for editing
        $this->jobPosting->updateStatus($jobPosting->id, 'draft');

        return Redirect::route('job-posting.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobPosting $jobPosting)
    {
        try {
            // Use repository to delete the job posting
            // This will also handle soft deletion and any related data cleanup
            $this->jobPosting->delete($jobPosting->id);

            return Redirect::route('job-posting.index');
        } catch (\Exception $e) {
            return Redirect::route('job-posting.index');
        }
    }


}
