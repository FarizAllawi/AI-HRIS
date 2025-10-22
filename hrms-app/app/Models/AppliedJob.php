<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AppliedJob extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'job_posting_id',
        'applicant_id',
        'ai_screening_score',
        'hr_screening_score',
    ];

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }

    public function jobPostingAnswers()
    {
        return $this->hasMany(AppliedJobAnswer::class);
    }
}
