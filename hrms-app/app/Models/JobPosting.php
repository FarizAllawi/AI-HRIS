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
        'responsibilities',
        'salary',
        'benefits',
        'type',
        'status',
    ];

    protected $casts = [
        'requirements' => 'array',      // <-- cast JSON to array
        'responsibilities' => 'array',   // <-- cast JSON to array
        'benefits' => 'array',          // <-- cast JSON to array
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
