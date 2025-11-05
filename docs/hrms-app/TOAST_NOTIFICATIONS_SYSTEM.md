# Toast Notifications System Documentation

This document describes the comprehensive toast notification system implemented for the HRIS job posting module using shadcn components and sonner.

## Overview

The toast notification system provides real-time feedback to users for all job posting actions, filter operations, and system interactions. It uses the shadcn Toaster component built on top of sonner for consistent, accessible, and visually appealing notifications.

## Architecture

### Components Used
- **shadcn Toaster**: Main toast component with theme integration
- **sonner**: Underlying toast library with rich features
- **Custom Hook**: `useJobPostingToasts` for consistent messaging
- **Layout Integration**: Toaster component in main app layout

### File Structure
```
resources/js/
├── components/ui/
│   └── sonner.tsx                    # shadcn Toaster component
├── hooks/
│   └── use-job-posting-toasts.ts     # Custom toast hook
├── layouts/app/
│   └── app-sidebar-layout.tsx        # Toaster integration
└── pages/HRMS/job-posting/
    └── index.tsx                     # Toast usage example
```

## Implementation

### 1. Toaster Component Setup

The shadcn Toaster component is integrated into the main layout:

**File:** `layouts/app/app-sidebar-layout.tsx`
```typescript
import { Toaster } from '@/components/ui/sonner';

export default function AppSidebarLayout() {
  return (
    <AppShell variant="sidebar">
      {/* Other layout components */}
      <Toaster position="top-right" richColors expand visibleToasts={5} />
    </AppShell>
  );
}
```

**Features:**
- **Position**: Top-right corner for non-intrusive display
- **Rich Colors**: Theme-aware color schemes
- **Expand**: Smooth expand/collapse animations
- **Visible Toasts**: Maximum of 5 toasts visible at once
- **Theme Integration**: Automatic light/dark mode support

### 2. Custom Toast Hook

**File:** `hooks/use-job-posting-toasts.ts`

The hook provides categorized toast functions for consistent messaging:

```typescript
export const useJobPostingToasts = () => {
  // Generic toast functions
  const showSuccess = (message: string, description?: string) => { ... };
  const showError = (message: string, description?: string) => { ... };
  const showInfo = (message: string, description?: string) => { ... };
  const showWarning = (message: string, description?: string) => { ... };

  // Job posting specific actions
  const jobPosting = {
    created: (title: string) => { ... },
    updated: (title: string) => { ... },
    published: (title: string) => { ... },
    // ... more actions
  };

  // Filter operations
  const filters = {
    applied: (count: number, total: number) => { ... },
    cleared: () => { ... },
    searchResults: (count: number, query: string) => { ... },
  };

  return { showSuccess, showError, showInfo, showWarning, jobPosting, filters };
};
```

## Toast Categories

### 1. Job Posting Actions

#### Success Actions
- **Created**: Job posting saved as draft
- **Updated**: Job posting modified successfully
- **Published**: Job posting made live
- **Archived**: Job posting moved to archives
- **Unarchived**: Job posting restored from archives
- **Deleted**: Job posting permanently removed

#### Progress Notifications
- **Publishing**: "Publishing job posting..."
- **Unpublishing**: "Unpublishing job posting..."
- **Archiving**: "Archiving job posting..."
- **Deleting**: "Deleting job posting..."

#### Error Handling
- **Delete Error**: Failed deletion with retry suggestion
- **Publish Error**: Failed publication with troubleshooting
- **Update Error**: Failed updates with guidance
- **Archive Error**: Failed archiving with alternatives

### 2. User Interface Actions

#### Navigation
- **Create New**: "Opening job posting creator"
- **View Details**: "Opening job posting - Loading details for [title]"
- **Edit Mode**: "Opening editor - Preparing to edit [title]"

#### Confirmations
- **Delete Warning**: "Delete confirmation required - Please confirm deletion of [title]"

### 3. Filter Operations

#### Filter Application
- **Results Found**: "Showing X of Y job postings - Filters have been applied"
- **No Results**: "No results found - Try adjusting your filters"
- **Search Results**: "Found X results - Matching [query]"

#### Filter Management
- **Filter Cleared**: Individual filter removal notifications
- **All Cleared**: "Filters cleared - Showing all job postings"

## Usage Examples

### 1. Basic Usage in Components

```typescript
import { useJobPostingToasts } from '@/hooks/use-job-posting-toasts';

export function JobPostingActions() {
  const { jobPosting: toasts, showSuccess } = useJobPostingToasts();

  const handlePublish = async (job: JobPosting) => {
    toasts.actionStarted.publishing(job.title);
    
    try {
      await publishJobPosting(job.id);
      toasts.published(job.title);
    } catch (error) {
      toasts.publishError(job.title);
    }
  };

  return <Button onClick={() => handlePublish(job)}>Publish</Button>;
}
```

### 2. Router Integration

```typescript
const handleDelete = (jobPosting: JobPosting) => {
  toasts.actionStarted.deleting(jobPosting.title);

  router.delete(`/HRMS/job-posting/${jobPosting.id}`, {
    onSuccess: () => {
      toasts.deleted(jobPosting.title);
    },
    onError: () => {
      toasts.deleteError(jobPosting.title);
    },
  });
};
```

### 3. Filter Integration

```typescript
const handleFiltersChange = useCallback(
  (filtered: JobPosting[], filters: JobPostingFilters) => {
    setFilteredJobPostings(filtered);
    
    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    if (hasActiveFilters) {
      filterToasts.applied(filtered.length, totalCount);
    }
  },
  [filterToasts, totalCount]
);
```

## Toast Types and Styling

### 1. Success Toasts
- **Icon**: CircleCheckIcon (green)
- **Color**: Green theme colors
- **Duration**: 4 seconds
- **Use Cases**: Completed actions, successful operations

### 2. Error Toasts
- **Icon**: OctagonXIcon (red)
- **Color**: Red theme colors
- **Duration**: 5 seconds (longer for errors)
- **Use Cases**: Failed operations, validation errors

### 3. Warning Toasts
- **Icon**: TriangleAlertIcon (yellow)
- **Color**: Yellow/amber theme colors
- **Duration**: 4 seconds
- **Use Cases**: Caution messages, confirmations needed

### 4. Info Toasts
- **Icon**: InfoIcon (blue)
- **Color**: Blue theme colors
- **Duration**: 4 seconds
- **Use Cases**: Status updates, navigation feedback

### 5. Loading Toasts
- **Icon**: Loader2Icon (animated spinner)
- **Color**: Neutral theme colors
- **Duration**: Until dismissed or replaced
- **Use Cases**: Ongoing operations, async actions

## Accessibility Features

### 1. Screen Reader Support
- **Semantic Roles**: Toast elements have proper ARIA roles
- **Live Regions**: Announcements for screen readers
- **Focus Management**: Non-intrusive focus handling

### 2. Keyboard Navigation
- **Dismissible**: Toasts can be dismissed with Escape key
- **Non-blocking**: Don't interrupt keyboard navigation
- **Queue Management**: Proper handling of multiple toasts

### 3. Visual Accessibility
- **High Contrast**: Theme-aware color schemes
- **Motion Respect**: Respects user motion preferences
- **Size Scaling**: Responds to user font size preferences

## Theme Integration

### 1. Light Mode
- **Background**: Clean white with subtle borders
- **Text**: Dark text for optimal contrast
- **Icons**: Colored icons matching action types
- **Shadows**: Subtle drop shadows for depth

### 2. Dark Mode
- **Background**: Dark surfaces with appropriate contrast
- **Text**: Light text for readability
- **Icons**: Theme-adjusted icon colors
- **Borders**: Subtle borders in dark theme colors

### 3. CSS Variables
```css
:root {
  --normal-bg: var(--popover);
  --normal-text: var(--popover-foreground);
  --normal-border: var(--border);
  --border-radius: var(--radius);
}
```

## Performance Considerations

### 1. Toast Queue Management
- **Maximum Visible**: 5 toasts to prevent UI clutter
- **Auto Dismiss**: Automatic dismissal based on type and importance
- **Memory Cleanup**: Proper cleanup of dismissed toasts

### 2. Bundle Size
- **Tree Shaking**: Only import necessary toast functions
- **Lazy Loading**: Icons and components loaded on demand
- **Minimal Dependencies**: Efficient use of sonner library

### 3. Rendering Performance
- **Portal Rendering**: Toasts rendered in separate DOM tree
- **Animation Optimization**: GPU-accelerated animations
- **State Management**: Minimal re-renders in parent components

## Best Practices

### 1. Message Content
- **Clear Actions**: Specific action descriptions
- **User Context**: Include relevant item names/titles
- **Helpful Details**: Descriptive messages with next steps
- **Consistent Tone**: Professional, helpful language

### 2. Timing
- **Success**: 4 seconds (enough time to read, not intrusive)
- **Errors**: 5 seconds (more time for error comprehension)
- **Info**: 3-4 seconds (quick status updates)
- **Loading**: Until action completes or errors

### 3. User Experience
- **Non-blocking**: Never block user interactions
- **Contextual**: Show toasts relevant to current action
- **Progressive**: Show progress for long-running operations
- **Recoverable**: Provide clear error recovery paths

## Customization Options

### 1. Position
```typescript
<Toaster 
  position="top-right"    // top-left, top-center, bottom-right, etc.
  richColors={true}       // Enable rich color themes
  expand={true}           // Expandable toast content
/>
```

### 2. Duration
```typescript
const showCustomToast = (message: string) => {
  toast.success(message, {
    duration: 6000,         // Custom duration in milliseconds
  });
};
```

### 3. Actions
```typescript
const showActionableToast = (message: string) => {
  toast.success(message, {
    action: {
      label: 'View',
      onClick: () => router.visit('/job-posting/123'),
    },
  });
};
```

## Error Handling

### 1. Network Errors
- **Automatic Retry**: Suggest retry for network failures
- **Offline Detection**: Handle offline scenarios
- **Timeout Handling**: Clear timeouts for long operations

### 2. Validation Errors
- **Field-Specific**: Toast messages for specific validation failures
- **Form Context**: Relate errors to form sections
- **Recovery Guidance**: Steps to resolve validation issues

### 3. System Errors
- **Graceful Degradation**: Fallback messages for unknown errors
- **Error Reporting**: Integration with error tracking
- **User Support**: Contact information for critical errors

## Testing

### 1. Unit Tests
```typescript
describe('useJobPostingToasts', () => {
  it('should show success toast for job creation', () => {
    const { result } = renderHook(() => useJobPostingToasts());
    
    result.current.jobPosting.created('Test Job');
    
    expect(toast.success).toHaveBeenCalledWith(
      'Job posting created successfully',
      { description: '"Test Job" has been saved as draft' }
    );
  });
});
```

### 2. Integration Tests
- **Action Flow**: Test complete action → toast flow
- **Error Scenarios**: Verify error toast display
- **Filter Integration**: Test filter toast behavior

### 3. Accessibility Tests
- **Screen Reader**: Verify announcements work correctly
- **Keyboard**: Test keyboard dismissal
- **Color Contrast**: Validate contrast ratios

## Future Enhancements

### 1. Advanced Features
- **Toast History**: View dismissed toasts
- **Persistent Toasts**: Important messages that persist
- **Custom Components**: Rich toast content with components
- **Sound Notifications**: Audio feedback for important actions

### 2. Analytics Integration
- **Usage Tracking**: Monitor toast effectiveness
- **User Behavior**: Understand user interaction patterns
- **Performance Metrics**: Track toast rendering performance

### 3. Internationalization
- **Multi-language**: Support for multiple languages
- **RTL Support**: Right-to-left language support
- **Cultural Adaptation**: Region-specific notification patterns

## Conclusion

The toast notification system provides a comprehensive, user-friendly way to communicate system status and action feedback. Built with shadcn components and modern React patterns, it ensures accessibility, performance, and maintainability while delivering an excellent user experience.

Key benefits:
- **Consistent Messaging**: Standardized toast patterns
- **Excellent UX**: Non-intrusive, informative notifications
- **Theme Integration**: Seamless light/dark mode support
- **Accessibility**: Full screen reader and keyboard support
- **Performance**: Optimized rendering and queue management
- **Maintainable**: Clean hook-based architecture

The system is ready for production use and can be easily extended for additional modules and use cases throughout the HRIS application.