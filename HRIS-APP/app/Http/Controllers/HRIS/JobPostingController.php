<?php

namespace App\Http\Controllers\HRIS;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobPostingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('HRIS/job-posting/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
    public function show(JobPosting $jobPosting)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobPosting $jobPosting)
    {
        //
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
