// job-posting-filters.tsx
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
    <Card className="w-full shadow-lg border-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:to-blue-900/20">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex w-full gap-3 flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-1.5">
                  <IconFilter className="h-4 w-4 text-white" />
                </div>
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                  >
                    {activeFiltersCount} active
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-3 text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 border-red-200 dark:border-red-800"
                >
                  <IconFilterOff className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
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
            <div className="flex w-full flex-wrap gap-2 pt-3">
              {Object.entries(filters).map(([key, value]) =>
                  value && (
                    <Badge
                      key={key}
                      variant="outline"
                      className="gap-1 text-xs bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-800"
                    >
                      {key === 'search' ? `Search: ${value}` :
                        key === 'dateRange' ? `Date: ${value}` :
                          key === 'applicantRange' ? `Applicants: ${value}` :
                            `${key}: ${value}`}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-3 w-3 p-0 hover:bg-transparent hover:text-red-600"
                        onClick={() => removeFilter(key as keyof JobPostingFilters)}
                      >
                        <IconX className="h-2 w-2" />
                      </Button>
                    </Badge>
                  )
              )}
            </div>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="w-full pt-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Search Input */}
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="search" className="font-semibold">Search</Label>
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
                    placeholder="Search job postings..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="pl-10 border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Status</Label>
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
                  <SelectTrigger className="border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
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
                  <Label className="font-semibold">Job Type</Label>
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
                  <SelectTrigger className="border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
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
                  <Label className="font-semibold">Department</Label>
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
                  <SelectTrigger className="border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
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
                  <Label className="font-semibold">Location</Label>
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
                  <SelectTrigger className="border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
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
                  <Label className="font-semibold">Date Created</Label>
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
                  <SelectTrigger className="border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
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
                  <Label className="font-semibold">Applicants</Label>
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
                  <SelectTrigger className="border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
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
