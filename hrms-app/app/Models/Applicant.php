<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Applicant extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'email',
        'phone',
        'portfolio_link',
        'resume_file',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appliedJobs()
    {
        return $this->hasMany(AppliedJob::class);
    }
}
