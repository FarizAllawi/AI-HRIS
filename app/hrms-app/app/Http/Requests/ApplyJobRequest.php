<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'portfolioLink' => 'nullable|url',
            // 👇 we’ll make resumeFile conditionally required
            'resumeFile' => [
                'nullable', // allow null first
                'file',
                'mimes:pdf,doc,docx',
                'max:10240',
            ],
            'answers' => 'required|array',
            'answers.*' => 'required|string',
        ];
    }

    public function withValidator($validator)
    {
        $validator->sometimes('resumeFile', 'required', function ($input) {
            // resumeFile is required only if the user has NO resumeMediaId
            return empty(auth()->user()?->applicant?->resume_media_id);
        });
    }
}
