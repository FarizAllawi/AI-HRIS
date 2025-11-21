<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobPostingIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get validated filters for job posting repository.
     */
    public function filters(): array
    {
        return [
            'status' => 'published',
            'title' => $this->validated('search'),
        ];
    }
}
