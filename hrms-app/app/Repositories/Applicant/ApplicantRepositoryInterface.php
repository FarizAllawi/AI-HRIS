<?php

namespace App\Repositories\Applicant;

use App\Repositories\Contracts\BaseRepositoryInterface;
use App\Models\Applicant;
use App\Models\User;
use Illuminate\Http\UploadedFile;

interface ApplicantRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Update the profile for the given user and optionally store a resume file.
     */
    public function updateProfile(User $user, array $data, ?UploadedFile $resumeFile = null): Applicant;

    /**
     * Find an applicant by id with necessary relations.
     */
    public function findWithRelations(string $id): Applicant;
}
