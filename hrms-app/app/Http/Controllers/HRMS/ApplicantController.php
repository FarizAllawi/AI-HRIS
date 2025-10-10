<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\ResponseFactory;

class ApplicantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('HRMS/applicant/index');
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
    public function show(string $id): Response|ResponseFactory
    {
        // Demo payload for UI preview; replace with real data source
        $applicant = [
            'id' => $id,
            'fullName' => 'Demo Applicant',
            'applicationDate' => '2025-09-01',
            'positionTitle' => 'Software Engineer',
            'positionCode' => 'ENG-101',
            'interviewStatus' => 'scheduled',
            'interviewDateTime' => '2025-10-15T14:30:00',
            'interviewType' => 'in_person',
            'interviewers' => ['Sarah Park'],
            'candidateResponse' => 'accepted',
            'contactEmail' => 'demo@applicant.test',
            'applicationStatus' => 'in_review',
            'feedbackStatus' => 'pending',
            'resumeScore' => 88,
            'referralSource' => 'Website',
        ];

        return Inertia::render('HRMS/applicant/detail', [
            'applicant' => $applicant,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
