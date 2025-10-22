<?php

namespace App\Http\Controllers\HRMS;

use App\Http\Controllers\Controller;
use App\Http\Requests\HRMS\ApplicantIndexRequest;
use App\Http\Resources\HRMS\ApplicantResource;
use App\Repositories\Applicant\ApplicantRepositoryInterface;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\ResponseFactory;

class ApplicantController extends Controller
{
    public function __construct(
        protected ApplicantRepositoryInterface $applicants
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(ApplicantIndexRequest $request): Response
    {
        $items = $this->applicants->all($request->validated());
        return Inertia::render('HRMS/applicant/index', [
            'applicants' => ApplicantResource::collection($items),
        ]);
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
    public function store(\Illuminate\Http\Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response|ResponseFactory
    {
        $applicant = $this->applicants->findWithRelations($id);
        return Inertia::render('HRMS/applicant/detail', [
            'applicant' => new ApplicantResource($applicant),
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
    public function update(\Illuminate\Http\Request $request, string $id)
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
