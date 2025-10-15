<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AppliedJobAnswer extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'job_posting_question_id',
        'applied_job_id',
        'answer',
        'ai_score',
        'hr_score',
    ];

    public function jobPostingQuestion()
    {
        return $this->belongsTo(JobPostingQuestion::class);
    }

    public function appliedJob()
    {
        return $this->belongsTo(AppliedJob::class);
    }
}
