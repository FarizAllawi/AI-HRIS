# Job Posting Filter Feature

This document describes the comprehensive filter feature implemented for the job posting index page in the HRIS system.

## Overview

The filter feature provides a user-friendly interface to search and filter job postings based on multiple criteria. It includes a collapsible filter panel with real-time filtering, active filter display, and comprehensive search capabilities.

## Features

### 🔍 **Search Functionality**
- **Global Search**: Searches across job title, description, department, and location
- **Real-time Filtering**: Results update immediately as you type
- **Case-insensitive**: Search is not case-sensitive for better UX

### 📊 **Filter Categories**

#### **Status Filter**
- Draft
- Published
- Unpublished
- Archived

#### **Job Type Filter**
- Full Time
- Part Time
- Contract
- Internship

#### **Department Filter**
- Dynamically populated from existing job postings
- Shows only departments that have job postings
- Alphabetically sorted

#### **Location Filter**
- Dynamically populated from existing job postings
- Shows only locations that have job postings
- Alphabetically sorted

#### **Date Created Filter**
- Today
- Last week
- Last month
- Last 3 months

#### **Applicant Range Filter**
- No applicants (0)
- 1-5 applicants
- 6-20 applicants
- 21+ applicants

## User Interface

### **Collapsible Filter Panel**
```typescript
// The filter panel can be expanded/collapsed
<Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
  // Filter content
</Collapsible>
```

### **Active Filter Display**
- Shows count of active filters with a blue badge
- Displays each active filter as a removable badge
- "Clear All" button to reset all filters at once

### **Filter Layout**
- Responsive grid: 1 column on mobile, 2 on tablet, 4 on desktop
- Clean card-based design with proper spacing
- Consistent form controls using shadcn/ui components

### **Results Summary**
```typescript
// Shows filtered count vs total count
const getFilterSummary = () => {
  const total = jobPostings?.length || 0;
  if (filteredCount === total) {
    return `Showing all ${total} job postings`;
  }
  return `Showing ${filteredCount} of ${total} job postings`;
};
```

## Technical Implementation

### **Component Structure**

#### **JobPostingFiltersComponent**
```typescript
interface JobPostingFiltersProps {
  jobPostings: JobPosting[];
  onFiltersChange: (
    filteredJobPostings: JobPosting[],
    activeFilters: JobPostingFilters
  ) => void;
}
```

#### **Filter State Management**
```typescript
const [filters, setFilters] = useState<JobPostingFilters>({
  search: '',
  status: '',
  type: '',
  department: '',
  location: '',
  dateRange: '',
  applicantRange: '',
});
```

### **Filter Logic**

#### **Real-time Filtering**
```typescript
useEffect(() => {
  const filtered = applyFilters(originalJobPostings, filters);
  onFiltersChange(filtered, filters);
}, [filters, originalJobPostings, onFiltersChange]);
```

#### **Multi-criteria Filtering**
```typescript
const applyFilters = (jobs: JobPosting[], currentFilters: JobPostingFilters): JobPosting[] => {
  return jobs.filter(job => {
    // Search across multiple fields
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      const searchMatch =
        job.title.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.department?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower);
      if (!searchMatch) return false;
    }
    
    // Apply other filters...
    return true;
  });
};
```

#### **Date Range Filtering**
```typescript
// Calculate days difference for date filtering
const daysDiff = Math.floor(
  (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24)
);

switch (currentFilters.dateRange) {
  case 'today': if (daysDiff > 0) return false; break;
  case 'week': if (daysDiff > 7) return false; break;
  case 'month': if (daysDiff > 30) return false; break;
  case '3months': if (daysDiff > 90) return false; break;
}
```

### **Dynamic Options Generation**
```typescript
// Extract unique departments from job postings
const uniqueDepartments = Array.from(
  new Set(jobPostings.map((job) => job.department).filter(Boolean)),
).sort();

// Extract unique locations from job postings
const uniqueLocations = Array.from(
  new Set(jobPostings.map((job) => job.location).filter(Boolean)),
).sort();
```

## File Structure

```
resources/js/
├── components/HRMS/job-posting/
│   ├── job-posting-filters.tsx     # Main filter component
│   ├── job-posting-table.tsx       # Updated with empty state
│   └── index.ts                    # Export filters component
├── pages/HRMS/job-posting/
│   └── index.tsx                   # Updated with filter integration
└── types/
    └── job-posting.ts              # Added JobPostingFilters interface
```

## Usage Example

### **Basic Integration**
```typescript
// In the index page
const [filteredJobPostings, setFilteredJobPostings] = useState<JobPosting[]>(
  jobPostings || []
);

const handleFiltersChange = (
  filtered: JobPosting[],
  filters: JobPostingFilters
) => {
  setFilteredJobPostings(filtered);
  setActiveFilters(filters);
  setFilteredCount(filtered.length);
};

// Render the filter component
<JobPostingFiltersComponent
  jobPostings={jobPostings || []}
  onFiltersChange={handleFiltersChange}
/>
```

### **Filter State Access**
```typescript
// Access active filters
const activeFiltersCount = Object.values(activeFilters)
  .filter((value) => value !== '').length;

// Check if any filters are active
const hasActiveFilters = Object.values(activeFilters)
  .some((value) => value !== '');
```

## Performance Considerations

### **Optimizations Implemented**
1. **Memoized Original Data**: Store original job postings to avoid re-filtering from props
2. **Client-side Filtering**: Fast filtering without server requests
3. **Efficient Re-renders**: Only update when filters actually change
4. **Dynamic Options**: Filter options are generated once and cached

### **Memory Usage**
- Filter state is lightweight (only string values)
- Original data is stored once and reused
- Filtered results are computed on-demand

## Accessibility Features

### **Keyboard Navigation**
- All filter controls are keyboard accessible
- Tab order flows logically through filters
- Clear focus indicators

### **Screen Reader Support**
- Proper labels for all form controls
- Semantic HTML structure
- ARIA attributes where needed

### **Visual Indicators**
- Clear active filter badges
- Results count display
- Empty state messaging

## Future Enhancements

### **Potential Improvements**
1. **Saved Filters**: Allow users to save and reuse filter combinations
2. **URL State**: Persist filters in URL for bookmarkable filtered views
3. **Advanced Date Picker**: Custom date range selection
4. **Bulk Actions**: Actions on filtered results
5. **Export Filtered Results**: Export only filtered job postings

### **Performance Optimizations**
1. **Debounced Search**: Add debouncing to search input
2. **Virtual Scrolling**: For large datasets
3. **Server-side Filtering**: Move to backend for very large datasets

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Dependencies

### **UI Components**
- shadcn/ui components (Button, Input, Select, Card, Badge, etc.)
- Tabler Icons for consistent iconography
- Collapsible component for expandable sections

### **React Features**
- useState for local state management
- useEffect for reactive filtering
- TypeScript interfaces for type safety

## Testing Considerations

### **Test Cases to Cover**
1. Filter application with single criteria
2. Multiple filter combinations
3. Search functionality across all fields
4. Clear individual filters
5. Clear all filters
6. Empty state handling
7. Dynamic option generation
8. Filter persistence during navigation

### **Performance Tests**
1. Large dataset filtering (1000+ items)
2. Rapid filter changes
3. Memory usage monitoring
4. Re-render frequency

## Conclusion

The Job Posting Filter Feature provides a comprehensive, user-friendly solution for managing and finding job postings. It combines powerful filtering capabilities with an intuitive interface, making it easy for users to locate specific job postings quickly and efficiently.