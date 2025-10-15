import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobPostingToasts } from '@/hooks/use-job-posting-toasts';
import { JobPosting, JobPostingFilters } from '@/types/job-posting';
import {
  IconChevronDown,
  IconChevronUp,
  IconFilter,
  IconFilterOff,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

interface JobPostingFiltersProps {
  jobPostings: JobPosting[];
  onFiltersChange: (
    filteredJobPostings: JobPosting[],
    activeFilters: JobPostingFilters,
  ) => void;
}

export function JobPostingFiltersComponent({
  jobPostings,
  onFiltersChange,
}: JobPostingFiltersProps) {
  const { filters: filterToasts, showInfo } = useJobPostingToasts();
  const [filters, setFilters] = useState<JobPostingFilters>({
    search: '',
    status: '',
    type: '',
    department: '',
    location: '',
    dateRange: '',
    applicantRange: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [originalJobPostings] = useState<JobPosting[]>(jobPostings);

  // Extract unique values from job postings for filter options
  const uniqueDepartments = Array.from(
    new Set(jobPostings.map((job) => job.department).filter(Boolean)),
  ).sort();

  const uniqueLocations = Array.from(
    new Set(jobPostings.map((job) => job.location).filter(Boolean)),
  ).sort();

  const applyFilters = (
    jobs: JobPosting[],
    currentFilters: JobPostingFilters,
  ): JobPosting[] => {
    return jobs.filter((job) => {
      // Search filter (title, description, department, location)
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const searchMatch =
          job.title.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.department?.toLowerCase().includes(searchLower) ||
          job.location?.toLowerCase().includes(searchLower);
        if (!searchMatch) return false;
      }

      // Status filter
      if (currentFilters.status && job.status !== currentFilters.status) {
        return false;
      }

      // Type filter
      if (currentFilters.type && job.type !== currentFilters.type) {
        return false;
      }

      // Department filter
      if (
        currentFilters.department &&
        job.department !== currentFilters.department
      ) {
        return false;
      }

      // Location filter
      if (currentFilters.location && job.location !== currentFilters.location) {
        return false;
      }

      // Date range filter
      if (currentFilters.dateRange) {
        const jobDate = new Date(job.created_at);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        switch (currentFilters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case '3months':
            if (daysDiff > 90) return false;
            break;
        }
      }

      // Applicant range filter
      if (currentFilters.applicantRange) {
        const applicantCount = job.totalApplicants || 0;
        switch (currentFilters.applicantRange) {
          case '0':
            if (applicantCount !== 0) return false;
            break;
          case '1-5':
            if (applicantCount < 1 || applicantCount > 5) return false;
            break;
          case '6-20':
            if (applicantCount < 6 || applicantCount > 20) return false;
            break;
          case '21+':
            if (applicantCount < 21) return false;
            break;
        }
      }

      return true;
    });
  };

  const handleFilterChange = (key: keyof JobPostingFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);

    // Apply filters immediately
    const filtered = applyFilters(originalJobPostings, newFilters);
    onFiltersChange(filtered, newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      type: '',
      department: '',
      location: '',
      dateRange: '',
      applicantRange: '',
    };
    setFilters(clearedFilters);

    // Apply cleared filters immediately
    const filtered = applyFilters(originalJobPostings, clearedFilters);
    onFiltersChange(filtered, clearedFilters);

    // Show toast notification
    filterToasts.cleared();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value !== '').length;
  };

  const removeFilter = (key: keyof JobPostingFilters) => {
    const newFilters = {
      ...filters,
      [key]: '',
    };
    setFilters(newFilters);

    // Apply filters immediately
    const filtered = applyFilters(originalJobPostings, newFilters);
    onFiltersChange(filtered, newFilters);

    // Show toast notification for individual filter removal
    const filterNames: Record<keyof JobPostingFilters, string> = {
      search: 'Search',
      status: 'Status',
      type: 'Job Type',
      department: 'Department',
      location: 'Location',
      dateRange: 'Date Range',
      applicantRange: 'Applicant Range',
    };
    showInfo(`${filterNames[key]} filter cleared`, 'Filter has been removed');
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6 w-full shadow-sm">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <IconFilter className="h-5 w-5 text-blue-600" />
                Filters
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="border-blue-200 bg-blue-100 text-blue-800"
                >
                  {activeFiltersCount} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-3 text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                >
                  <IconFilterOff className="mr-1 h-4 w-4" />
                  Clear All
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  {isExpanded ? (
                    <IconChevronUp className="h-4 w-4" />
                  ) : (
                    <IconChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex w-full flex-wrap gap-2 pt-2">
              {filters.search && (
                <Badge variant="outline" className="gap-1">
                  Search: {filters.search}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('search')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="outline" className="gap-1">
                  Status: {filters.status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('status')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.type && (
                <Badge variant="outline" className="gap-1">
                  Type: {filters.type}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('type')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.department && (
                <Badge variant="outline" className="gap-1">
                  Department: {filters.department}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('department')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="outline" className="gap-1">
                  Location: {filters.location}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('location')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.dateRange && (
                <Badge variant="outline" className="gap-1">
                  Date: {filters.dateRange}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('dateRange')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.applicantRange && (
                <Badge variant="outline" className="gap-1">
                  Applicants: {filters.applicantRange}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter('applicantRange')}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="w-full pt-0">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Search Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="search">Search</Label>
                  {filters.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('search', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by title, description, department..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Status</Label>
                  {filters.status && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('status', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="unpublish">Unpublished</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Job Type</Label>
                  {filters.type && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('type', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Department</Label>
                  {filters.department && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('department', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select
                  value={filters.department}
                  onValueChange={(value) =>
                    handleFilterChange('department', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept!}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Location</Label>
                  {filters.location && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('location', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select
                  value={filters.location}
                  onValueChange={(value) =>
                    handleFilterChange('location', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location!}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Date Created</Label>
                  {filters.dateRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('dateRange', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) =>
                    handleFilterChange('dateRange', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last week</SelectItem>
                    <SelectItem value="month">Last month</SelectItem>
                    <SelectItem value="3months">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Applicant Range Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Applicants</Label>
                  {filters.applicantRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFilterChange('applicantRange', '')}
                      className="h-5 px-2 text-xs text-muted-foreground hover:text-red-600"
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Select
                  value={filters.applicantRange}
                  onValueChange={(value) =>
                    handleFilterChange('applicantRange', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No applicants</SelectItem>
                    <SelectItem value="1-5">1-5 applicants</SelectItem>
                    <SelectItem value="6-20">6-20 applicants</SelectItem>
                    <SelectItem value="21+">21+ applicants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
