<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class JobPostingQuestion extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'job_posting_id',
        'questions',
        'weight',
    ];

    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class);
    }

    public function appliedJobAnswers()
    {
        return $this->hasMany(AppliedJobAnswer::class);
    }
}
