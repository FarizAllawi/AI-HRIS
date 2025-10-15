<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class FormJobPostingResource extends JobPostingResource
{
    /**
     * Transform the resource into an array specifically for forms.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        // Ensure we have at least one empty item for each array field if empty
        // This prevents form rendering issues when arrays are empty
        $data['requirements'] = $this->ensureMinimumArrayItems($data['requirements']);
        $data['responsibilities'] = $this->ensureMinimumArrayItems($data['responsibilities']);
        $data['benefits'] = $this->ensureMinimumArrayItems($data['benefits']);
        $data['questions'] = $this->ensureMinimumQuestionItems($data['questions']);

        return $data;
    }

    /**
     * Ensure array has at least one item with proper structure for form fields
     *
     * @param array $items
     * @return array
     */
    private function ensureMinimumArrayItems(array $items): array
    {
        if (empty($items)) {
            return [['value' => '']];
        }

        return $items;
    }

    /**
     * Ensure questions array has at least one item with proper structure
     *
     * @param array $questions
     * @return array
     */
    private function ensureMinimumQuestionItems(array $questions): array
    {
        if (empty($questions)) {
            return [['question' => '', 'description' => '', 'weight' => '']];
        }

        return $questions;
    }

    /**
     * Additional validation for form data
     *
     * @return array<string, mixed>
     */
    public function toFormData(): array
    {
        $data = $this->toArray(request());

        // Ensure all required fields have proper defaults
        $data['title'] = $data['title'] ?? '';
        $data['description'] = $data['description'] ?? '';
        $data['location'] = $data['location'] ?? '';
        $data['departments'] = $data['departments'] ?? '';
        $data['salary'] = $data['salary'] ?? '';
        $data['type'] = $data['type'] ?? 'full-time';

        // Convert archived status to draft for form editing
        // since archived items shouldn't be editable in archived state
        $status = $data['status'] ?? 'draft';
        $data['status'] = $status === 'archived' ? 'draft' : $status;

        return $data;
    }
}
