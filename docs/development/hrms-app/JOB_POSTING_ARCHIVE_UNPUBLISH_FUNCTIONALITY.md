# Job Posting Archive and Unpublish Functionality

This document describes the newly implemented archive and unpublish functionality for job postings in the HRIS system.

## Overview

The system now supports four job posting statuses:
- `draft` - Job posting is being created/edited
- `published` - Job posting is live and accepting applications
- `unpublish` - Job posting is temporarily hidden but can be republished
- `archived` - Job posting is permanently stored but no longer active

## Backend Implementation

### Routes Added
```php
Route::put('job-posting/{jobPosting}/publish', [JobPostingController::class, 'publish']);
Route::put('job-posting/{jobPosting}/archived', [JobPostingController::class, 'archived']);
Route::put('job-posting/{jobPosting}/unarchive', [JobPostingController::class, 'unarchive']);
Route::put('job-posting/{jobPosting}/unpublish', [JobPostingController::class, 'unpublish']);
```

### Controller Methods Added

#### `archived(JobPosting $jobPosting)`
- Sets job posting status to 'archived'
- Returns success message
- Permanently removes from active listings

#### `unpublish(JobPosting $jobPosting)`
- Sets job posting status to 'unpublish'
- Returns success message
- Temporarily hides from public but keeps for potential republishing

#### `publish(JobPosting $jobPosting)`
- Sets job posting status to 'published'
- Returns success message
- Makes job posting live and visible

#### `unarchive(JobPosting $jobPosting)`
- Sets job posting status to 'draft'
- Returns success message
- Allows editing of previously archived job posting

### Repository Updates

#### New Method: `updateStatus(string $id, string $status)`
- Simple status-only updates without full validation
- Uses database transactions with row locking
- More efficient than full job posting update for status changes

## Frontend Implementation

### UI Components Updated

#### ActionButtons Component
- Added archive (`IconArchive`) and unarchive (`IconArchiveOff`) buttons
- Different button sets based on current status:
  - **Published**: View, Unpublish, Archive
  - **Unpublish**: View, Edit, Publish, Archive
  - **Draft**: View, Edit, Publish, Delete
  - **Archived**: View, Unarchive

#### Job Posting Table
- Added "Unpublished" status badge (red)
- Updated status badge colors for better visual distinction
- Maintained existing "Draft", "Published", and "Archived" badges

#### Index Page Handlers
- `handleArchive()` - Archives job posting
- `handleUnpublish()` - Unpublishes job posting
- `handleToggleStatus()` - Smart toggle based on current status:
  - Published → Unpublish (via separate handler)
  - Archived → Draft (unarchive)
  - Draft/Unpublish → Published

## Status Transition Flow

```
Draft ←→ Published
  ↓         ↓
  ↓    Unpublish ←→ Published
  ↓         ↓
  ↓    Archived
  ↓         ↑
  └─────────┘
```

### Allowed Transitions
1. **Draft → Published**: Publish job posting
2. **Published → Unpublish**: Temporarily hide job posting
3. **Published → Archived**: Permanently archive job posting
4. **Unpublish → Published**: Republish job posting
5. **Unpublish → Archived**: Archive unpublished job posting
6. **Archived → Draft**: Restore for editing (unarchive)

## Database Schema

The existing `job_postings` table already supports all required statuses:
```php
$table->enum('status', ['draft', 'published', 'unpublish', 'archived'])->default('draft');
```

## API Endpoints

### Archive Job Posting
```
PUT /HRMS/job-posting/{id}/archived
```

### Unpublish Job Posting
```
PUT /HRMS/job-posting/{id}/unpublish
```

### Publish Job Posting
```
PUT /HRMS/job-posting/{id}/publish
```

### Unarchive Job Posting
```
PUT /HRMS/job-posting/{id}/unarchive
```

## Usage Examples

### Frontend Usage
```typescript
// Archive a job posting
const handleArchive = (jobPosting: JobPosting) => {
  router.put(`/HRMS/job-posting/${jobPosting.id}/archived`, {}, {
    onSuccess: () => {
      // Success message will be shown
    }
  });
};

// Unpublish a job posting
const handleUnpublish = (jobPosting: JobPosting) => {
  router.put(`/HRMS/job-posting/${jobPosting.id}/unpublish`, {}, {
    onSuccess: () => {
      // Success message will be shown
    }
  });
};
```

### Backend Usage
```php
// In controller or service
$jobPostingRepository->updateStatus($jobPostingId, 'archived');
$jobPostingRepository->updateStatus($jobPostingId, 'unpublish');
$jobPostingRepository->updateStatus($jobPostingId, 'published');
```

## Benefits

1. **Flexibility**: Job postings can be temporarily hidden without losing data
2. **Organization**: Clear separation between active, inactive, and archived postings
3. **Data Retention**: Archived postings preserve historical data
4. **User Experience**: Intuitive UI with clear status indicators and actions
5. **Performance**: Status-only updates are more efficient than full updates

## Future Enhancements

- Filter job postings by status in the index page
- Bulk archive/unpublish operations
- Automatic archiving based on expiry dates
- Activity logs for status changes
- Notifications for status changes