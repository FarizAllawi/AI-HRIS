<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobPostingPublicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('job-posting');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        return Inertia::render('job-posting-detail');
    }
  
}
