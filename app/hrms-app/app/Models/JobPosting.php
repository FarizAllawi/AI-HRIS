<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class JobPosting extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'location',
        'departments',
        'requirements',
        'qualifications',
        'responsibilities',
        'required_skills',
        'preferred_skills',
        'salary',
        'benefits',
        'type',
        'status',
    ];

    protected $casts = [
        'requirements' => 'array',
        'responsibilities' => 'array',
        'qualifications' => 'array',
        'required_skills' => 'array',
        'preferred_skills' => 'array',
        'benefits' => 'array',
    ];

    public function questions()
    {
        return $this->hasMany(JobPostingQuestion::class);
    }

    public function appliedJobs()
    {
        return $this->hasMany(AppliedJob::class);
    }
}
