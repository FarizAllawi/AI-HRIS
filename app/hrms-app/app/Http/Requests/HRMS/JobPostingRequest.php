<?php

namespace App\Http\Requests\HRMS;

use Illuminate\Foundation\Http\FormRequest;

class JobPostingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'nullable|string|max:255',
            'departments' => 'nullable|string|max:255',
            'salary' => 'nullable|string|max:255',
            'type' => 'required|string|in:full-time,part-time,contract,internship',
            'status' => 'required|string|in:draft,published,unpublish,archived',

            // Requirements, Responsibilities, and Benefits (stored as JSON)
            'requirements' => 'required|array|min:1',
            'requirements.*.id' => 'required|string|max:255',
            'requirements.*.value' => 'required|string|max:255',

            'responsibilities' => 'required|array|min:1',
            'responsibilities.*.id' => 'required|string|max:255',
            'responsibilities.*.value' => 'required|string|max:255',

            'qualifications' => 'required|array|min:1',
            'qualifications.*.id' => 'required|string|max:255',
            'qualifications.*.value' => 'required|string|max:255',

            'required_skills' => 'nullable|array|min:1',
            'required_skills.*.id' => 'nullable|string|max:255',
            'required_skills.*.value' => 'nullable|string|max:255',

            'preferred_skills' => 'nullable|array|min:0',
            'preferred_skills.*.id' => 'nullable|string|max:255',
            'preferred_skills.*.value' => 'nullable|string|max:255',

            'benefits' => 'nullable|array',
            'benefits.*.id' => 'nullable|string|max:255',
            'benefits.*.value' => 'nullable|string|max:255',

            // Questions of the job
            'questions' => 'nullable|array',
            'questions.*.id' => 'nullable|string|max:255',
            'questions.*.question' => 'required|string',
            'questions.*.description' => 'nullable|string',
            'questions.*.weight' => 'nullable|numeric|min:0',
            'questions.*.mapped_competencies' => 'nullable|array',
            'questions.*.mapped_competencies.*' => 'string',
        ];
    }

    public function messages(): array
    {
        return [
            'requirements.*.value.required' => 'Each requirement is required',
            'responsibilities.*.value.required' => 'Each responsibility is required',
            'questions.*.question.required' => 'Each question is required',
        ];
    }

    public function authorize(): bool
    {
        return true; // You can implement permissions here if needed
    }
}
