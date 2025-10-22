<?php

namespace App\Http\Requests\HRMS;

use Illuminate\Foundation\Http\FormRequest;

class ApplicantIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'job_posting_id' => ['nullable', 'uuid'],
        ];
    }
}
