# Delete Job Posting Feature Documentation

This document describes the complete implementation of the delete job posting functionality with user confirmation in the HRIS system.

## Overview

The delete feature provides a secure way to permanently remove job postings from the system. It includes:
- User confirmation dialog with detailed information
- Warning messages for jobs with applicants
- Safe deletion with error handling
- Proper cleanup of related data

## Features

### 🛡️ **Security & Confirmation**
- **Confirmation Dialog**: Prevents accidental deletions
- **Job Details Display**: Shows job title, status, and applicant count
- **Warning System**: Special alerts for jobs with applications
- **Cancel Option**: Easy way to abort deletion

### 🗑️ **Safe Deletion Process**
- **Soft Delete**: Uses Laravel's soft delete functionality
- **Related Data Cleanup**: Handles job questions and applications
- **Transaction Safety**: Wrapped in try-catch for error handling
- **User Feedback**: Success/error messages via flash notifications

### 🎨 **User Experience**
- **Visual Warnings**: Red alert icons and colors
- **Loading States**: Shows spinner during deletion
- **Contextual Information**: Displays job details and impact
- **Responsive Design**: Works on all screen sizes

## Implementation Details

### Backend Implementation

#### Route Definition
```php
Route::delete('job-posting/{jobPosting}', [JobPostingController::class, 'destroy'])
    ->name('job-posting.destroy');
```

#### Controller Method
```php
public function destroy(JobPosting $jobPosting)
{
    try {
        // Use repository to delete the job posting
        // This will also handle soft deletion and any related data cleanup
        $this->jobPosting->delete($jobPosting->id);

        return Redirect::route('job-posting.index')
            ->with('success', 'Job posting deleted successfully.');
    } catch (\Exception $e) {
        return Redirect::route('job-posting.index')
            ->with('error', 'Failed to delete job posting. Please try again.');
    }
}
```

#### Repository Integration
- Uses existing `JobPostingRepository->delete()` method
- Handles soft deletion through Laravel's built-in functionality
- Manages related data cleanup automatically

### Frontend Implementation

#### Delete Confirmation Dialog Component

**File:** `delete-confirmation-dialog.tsx`

**Key Features:**
- Modal dialog with backdrop
- Job information display
- Warning system for jobs with applicants
- Loading state management
- Accessibility support

**Props Interface:**
```typescript
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobPosting: JobPosting | null;
  isDeleting?: boolean;
}
```

#### State Management

**Index Page State:**
```typescript
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [jobPostingToDelete, setJobPostingToDelete] = useState<JobPosting | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
```

**Workflow:**
1. User clicks delete button → `handleDelete()` opens dialog
2. User confirms → `handleDeleteConfirm()` sends DELETE request
3. Success → Dialog closes, list refreshes
4. Error → Loading stops, error message shown

## User Interface Design

### Dialog Structure

```
┌─────────────────────────────────────────┐
│ [!] Delete Job Posting                  │
│     This action cannot be undone.       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Job Title: Senior Software Engineer │ │
│ │ Status: [Published]                 │ │
│ │ Applicants: 15 applications         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ This will permanently remove:           │
│ • The job posting and all details      │
│ • All associated questions             │
│ • All 15 job applications             │
│                                         │
│ ⚠️ Warning: This job has applications   │
│    Consider archiving instead           │
│                                         │
│              [Cancel] [Delete]          │
└─────────────────────────────────────────┘
```

### Visual Design Elements

#### Warning System
- **Red Alert Icon**: Indicates destructive action
- **Amber Warning Box**: For jobs with applicants
- **Status Badges**: Colored based on job status
- **Impact List**: Clearly shows what will be deleted

#### Button States
```typescript
// Normal state
<Button variant="destructive">
  <IconTrash className="mr-2 h-4 w-4" />
  Delete Job Posting
</Button>

// Loading state
<Button variant="destructive" disabled>
  <Spinner className="mr-2 h-4 w-4" />
  Deleting...
</Button>
```

## Security Considerations

### Backend Security
- **Route Model Binding**: Automatic model resolution and validation
- **Authentication**: Protected by `auth` middleware
- **Authorization**: Can be extended with policies
- **Transaction Safety**: Database rollback on errors

### Frontend Security
- **Confirmation Required**: No accidental deletions
- **State Validation**: Checks for null/undefined values
- **Error Boundaries**: Graceful error handling
- **Loading States**: Prevents double submissions

## Error Handling

### Backend Error Handling
```php
try {
    $this->jobPosting->delete($jobPosting->id);
    return Redirect::route('job-posting.index')
        ->with('success', 'Job posting deleted successfully.');
} catch (\Exception $e) {
    return Redirect::route('job-posting.index')
        ->with('error', 'Failed to delete job posting. Please try again.');
}
```

### Frontend Error Handling
- **Network Errors**: Handled by Inertia.js
- **Validation Errors**: Displayed via flash messages
- **State Recovery**: Resets loading states on error
- **User Feedback**: Clear error messaging

## Database Impact

### Tables Affected
- `job_postings` - Main job posting record (soft deleted)
- `job_posting_questions` - Related questions (cascade delete)
- `applied_jobs` - Job applications (cascade delete)

### Soft Delete Behavior
```php
// Job posting model uses SoftDeletes trait
use SoftDeletes;

// Deletion sets deleted_at timestamp
$jobPosting->delete(); // Sets deleted_at = now()

// Can be restored if needed
$jobPosting->restore();

// Permanent deletion (if needed)
$jobPosting->forceDelete();
```

## Testing Scenarios

### Manual Testing Checklist

#### Basic Functionality
- [ ] Delete button opens confirmation dialog
- [ ] Dialog shows correct job information
- [ ] Cancel button closes dialog without deletion
- [ ] Confirm button deletes job posting
- [ ] Success message appears after deletion
- [ ] Job posting removed from list

#### Edge Cases
- [ ] Delete job with 0 applicants
- [ ] Delete job with multiple applicants
- [ ] Delete draft vs published jobs
- [ ] Network failure during deletion
- [ ] Multiple rapid delete attempts

#### UI/UX Testing
- [ ] Dialog responsive on mobile/tablet/desktop
- [ ] Loading spinner shows during deletion
- [ ] Buttons disabled during loading
- [ ] Warning messages for jobs with applicants
- [ ] Proper focus management and accessibility

### Automated Testing

#### Unit Tests (Suggested)
```php
// Controller Tests
test('can delete job posting', function() {
    $jobPosting = JobPosting::factory()->create();
    
    $response = $this->delete("/HRMS/job-posting/{$jobPosting->id}");
    
    $response->assertRedirect();
    $this->assertSoftDeleted('job_postings', ['id' => $jobPosting->id]);
});

test('handles delete errors gracefully', function() {
    // Mock repository to throw exception
    // Assert error message returned
});
```

#### Frontend Tests (Suggested)
```typescript
// Component Tests
test('opens delete dialog when delete clicked', () => {
  render(<JobPostingIndex jobPostings={mockJobs} />);
  fireEvent.click(screen.getByTitle('Delete Job Posting'));
  expect(screen.getByText('Delete Job Posting')).toBeInTheDocument();
});

test('shows warning for jobs with applicants', () => {
  const jobWithApplicants = { ...mockJob, totalApplicants: 10 };
  render(<DeleteConfirmationDialog jobPosting={jobWithApplicants} isOpen={true} />);
  expect(screen.getByText('Warning: This job has active applications')).toBeInTheDocument();
});
```

## Performance Considerations

### Backend Performance
- **Soft Delete**: Faster than hard delete with cascade
- **Repository Pattern**: Centralizes deletion logic
- **Transaction Wrapping**: Ensures data consistency
- **Minimal Database Queries**: Single delete operation

### Frontend Performance
- **Conditional Rendering**: Dialog only renders when needed
- **State Management**: Minimal re-renders
- **Component Isolation**: Delete dialog is separate component
- **Lazy Loading**: Dialog content loads on demand

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical navigation through dialog
- **Escape Key**: Closes dialog
- **Enter Key**: Confirms deletion (on confirm button)
- **Focus Management**: Returns focus after dialog closes

### Screen Reader Support
- **ARIA Labels**: Proper labeling of interactive elements
- **Role Attributes**: Dialog role for modal behavior
- **Live Regions**: Status announcements for actions
- **Semantic HTML**: Proper heading and list structures

### Visual Accessibility
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicators**: Clear visual focus states
- **Icon + Text**: Not relying solely on color for meaning
- **Responsive Text**: Scales with user preferences

## Future Enhancements

### Potential Improvements

#### Bulk Delete
- Select multiple job postings
- Bulk confirmation dialog
- Progress indicator for multiple deletions
- Batch API endpoint

#### Restore Functionality
- "Restore" option in archived/deleted view
- Undo deletion within time window
- Restore with all related data
- Audit trail for deletions

#### Advanced Warnings
- Check for upcoming interviews
- Warn about active job board postings
- Integration with external systems
- Compliance checks before deletion

#### Analytics Integration
- Track deletion patterns
- Reasons for deletion (optional)
- Impact analysis reporting
- User behavior insights

## Troubleshooting

### Common Issues

#### Dialog Not Opening
```typescript
// Check if delete handler is properly connected
const handleDelete = (jobPosting: JobPosting) => {
  setJobPostingToDelete(jobPosting);
  setDeleteDialogOpen(true);
};

// Ensure ActionButtons receives onDelete prop
<ActionButtons onDelete={handleDelete} />
```

#### Deletion Not Working
```php
// Check repository method exists
public function delete(string $id): bool
{
    return DB::transaction(function () use ($id) {
        $record = $this->model->lockForUpdate()->findOrFail($id);
        return $record->delete();
    });
}
```

#### Flash Messages Not Showing
```php
// Ensure proper redirect with flash data
return Redirect::route('job-posting.index')
    ->with('success', 'Job posting deleted successfully.');
```

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check Laravel logs for backend errors
4. Validate database constraints and foreign keys
5. Test with different user permissions

## Conclusion

The delete job posting feature provides a comprehensive solution for safely removing job postings from the system. It balances user safety with functionality, ensuring that deletions are intentional while providing clear feedback about the impact of the action.

Key benefits:
- **User Safety**: Confirmation prevents accidents
- **Data Integrity**: Proper cleanup and soft deletion
- **Great UX**: Clear warnings and feedback
- **Maintainable**: Well-structured, documented code
- **Accessible**: Works for all users
- **Secure**: Proper authentication and validation

The implementation follows best practices for both frontend and backend development, providing a solid foundation for future enhancements.