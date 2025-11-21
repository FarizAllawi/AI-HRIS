<?php

namespace App\Events;

use App\Models\JobPosting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobPostingEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public JobPosting $jobPosting;
    public string $action; // 'create' or 'update'

    /**
     * Create a new event instance.
     */
    public function __construct(JobPosting $jobPosting, string $action)
    {
        $this->jobPosting = $jobPosting;
        $this->action = $action;
    }
}
