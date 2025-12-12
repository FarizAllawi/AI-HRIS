import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

import { useJobPostingToasts } from '@/hooks/use-job-posting-toasts';
import { index as jobPosting } from '@/routes/job-posting';
import { type BreadcrumbItem } from '@/types';

import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AppLayout from '@/layouts/app-layout';

import {
  DeleteConfirmationDialog,
  JobPostingFiltersComponent,
  JobPostingTable,
  JobPostingCardView,
} from '@/components/HRMS/job-posting';

import { JobPosting, JobPostingFilters } from '@/types/job-posting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Filter,
  Table,
  LayoutGrid,
  Sparkles,
  BarChart3,
  Users,
  Briefcase
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Job Posting',
    href: jobPosting().url,
  },
];

export default function JobPostingIndex({
                                          jobPostings,
                                        }: {
  jobPostings: JobPosting[];
}) {
  const {
    jobPosting: toasts,
    filters: filterToasts,
    showInfo,
    showWarning,
  } = useJobPostingToasts();

  const [filteredJobPostings, setFilteredJobPostings] = useState<JobPosting[]>(
    jobPostings || [],
  );
  const [activeFilters, setActiveFilters] = useState<JobPostingFilters>({
    search: '',
    status: '',
    type: '',
    department: '',
    location: '',
    dateRange: '',
    applicantRange: '',
  });
  const [filteredCount, setFilteredCount] = useState(jobPostings?.length || 0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobPostingToDelete, setJobPostingToDelete] =
    useState<JobPosting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');

  const handleCreateNew = () => {
    showInfo(
      'Opening job posting creator',
      'Prepare to create a new job posting',
    );
    router.visit('/HRMS/job-posting/create', { method: 'get' });
  };

  const handleView = (jobPosting: JobPosting) => {
    if (jobPosting.status === 'draft') {
      router.visit(`/HRMS/job-posting/${jobPosting.id}/edit`);
    } else {
      router.visit(`/HRMS/job-posting/${jobPosting.id}`);
    }
  };

  const handleEdit = (jobPosting: JobPosting) => {
    router.visit(`/HRMS/job-posting/${jobPosting.id}/edit`);
  };

  const handleDelete = (jobPosting: JobPosting) => {
    setJobPostingToDelete(jobPosting);
    setDeleteDialogOpen(true);
    showWarning(
      'Delete confirmation required',
      `Please confirm deletion of "${jobPosting.title}"`,
    );
  };

  const handleDeleteConfirm = () => {
    if (!jobPostingToDelete) return;

    setIsDeleting(true);
    toasts.actionStarted.deleting(jobPostingToDelete.title);

    router.delete(`/HRMS/job-posting/${jobPostingToDelete.id}`, {
      onSuccess: () => {
        toasts.deleted(jobPostingToDelete.title);
        setDeleteDialogOpen(false);
        setJobPostingToDelete(null);
        setIsDeleting(false);
      },
      onError: () => {
        toasts.deleteError(jobPostingToDelete.title);
        setIsDeleting(false);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setJobPostingToDelete(null);
    setIsDeleting(false);
  };

  const handleToggleStatus = (jobPosting: JobPosting) => {
    if (jobPosting.status === 'published') {
      handleUnpublish(jobPosting);
    } else if (jobPosting.status === 'archived') {
      toasts.actionStarted.unarchiving(jobPosting.title);
      router.put(
        `/HRMS/job-posting/${jobPosting.id}/unarchive`,
        {},
        {
          onSuccess: () => {
            toasts.unarchived(jobPosting.title);
          },
          onError: () => {
            toasts.archiveError(
              jobPosting.title,
              'Failed to restore job posting',
            );
          },
        },
      );
    } else {
      toasts.actionStarted.publishing(jobPosting.title);
      router.put(
        `/HRMS/job-posting/${jobPosting.id}/publish`,
        {},
        {
          onSuccess: () => {
            toasts.published(jobPosting.title);
          },
          onError: () => {
            toasts.publishError(jobPosting.title);
          },
        },
      );
    }
  };

  const handleArchive = (jobPosting: JobPosting) => {
    toasts.actionStarted.archiving(jobPosting.title);
    router.put(
      `/HRMS/job-posting/${jobPosting.id}/archive`,
      {},
      {
        onSuccess: () => {
          toasts.archived(jobPosting.title);
        },
        onError: () => {
          toasts.archiveError(jobPosting.title);
        },
      },
    );
  };

  const handleUnpublish = (jobPosting: JobPosting) => {
    toasts.actionStarted.unpublishing(jobPosting.title);
    router.put(
      `/HRMS/job-posting/${jobPosting.id}/unpublish`,
      {},
      {
        onSuccess: () => {
          toasts.unpublished(jobPosting.title);
        },
        onError: () => {
          toasts.publishError(
            jobPosting.title,
            'Failed to unpublish job posting',
          );
        },
      },
    );
  };

  const handleFiltersChange = useCallback(
    (filtered: JobPosting[], filters: JobPostingFilters) => {
      setFilteredJobPostings(filtered);
      setActiveFilters(filters);
      setFilteredCount(filtered.length);

      const hasActiveFilters = Object.values(filters).some(
        (value) => value !== '',
      );
      if (hasActiveFilters) {
        filterToasts.applied(filtered.length, jobPostings?.length || 0);
      }
    },
    [filterToasts, jobPostings?.length],
  );

  const getFilterSummary = () => {
    const total = jobPostings?.length || 0;
    if (filteredCount === total) {
      return `Showing all ${total} job postings`;
    }
    return `Showing ${filteredCount} of ${total} job postings`;
  };

  const getStatusStats = () => {
    const stats = {
      published: jobPostings?.filter(jp => jp.status === 'published').length || 0,
      draft: jobPostings?.filter(jp => jp.status === 'draft').length || 0,
      archived: jobPostings?.filter(jp => jp.status === 'archived').length || 0,
    };
    return stats;
  };

  const statusStats = getStatusStats();

  // Initialize filtered data on mount
  useEffect(() => {
    setFilteredJobPostings(jobPostings || []);
    setFilteredCount(jobPostings?.length || 0);

    // Set view mode based on screen size
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'card' : 'table');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [jobPostings]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Job Posting" />
      <HRMSContentLayout
        iconTitle={<Briefcase className="w-6 h-6 text-white"/> }
        title="Job Postings"
        description="Manage and track all job postings in your organization. Create new positions, review applications, and optimize your hiring process."
        actionButton={(
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2 hidden sm:flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Job
          </Button>
        )}
      >
        <div className="w-full space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Jobs</p>
                  <p className="text-2xl font-bold mt-1">{jobPostings?.length || 0}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold mt-1">{statusStats.published}</p>
                </div>
                <Users className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Drafts</p>
                  <p className="text-2xl font-bold mt-1">{statusStats.draft}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Archived</p>
                  <p className="text-2xl font-bold mt-1">{statusStats.archived}</p>
                </div>
                <Sparkles className="h-8 w-8 text-gray-200" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="w-full">
            <JobPostingFiltersComponent
              jobPostings={jobPostings || []}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Header with View Toggle */}
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Job Postings
                </h3>

                {Object.values(activeFilters).some((value) => value !== '') && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full shadow-sm border-0">
                    <Filter className="h-3 w-3 mr-1" />
                    Filters Active
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {getFilterSummary()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Enhanced View Toggle */}
              <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'table' | 'card')}
                className="w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <TabsTrigger
                    value="table"
                    className="flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
                  >
                    <Table className="h-4 w-4" />
                    <span className="hidden sm:inline">Table</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="card"
                    className="flex items-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Quick Action Button */}

            </div>
          </div>

          {/* Mobile Create Button */}
          <div className="sm:hidden fixed bottom-6 right-6 z-10">
            <Button
              onClick={handleCreateNew}
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-14 h-14"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="w-full">
            { jobPostings.length > 0 && viewMode === 'table' ? (
              <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <JobPostingTable
                  jobPostings={filteredJobPostings}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onArchive={handleArchive}
                  onUnpublish={handleUnpublish}
                />
              </div>
            ) : jobPostings.length > 0 && viewMode === 'card' ? (
              <div className="space-y-4">
                <JobPostingCardView
                  jobPostings={filteredJobPostings}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onArchive={handleArchive}
                  onUnpublish={handleUnpublish}
                />
              </div>
            ) : (
              <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20">
                <Briefcase className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  No job postings found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  {Object.values(activeFilters).some(value => value !== '')
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first job posting to attract top talent."
                  }
                </p>
                {!Object.values(activeFilters).some(value => value !== '') && (
                  <Button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Job Posting
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={deleteDialogOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            jobPosting={jobPostingToDelete}
            isDeleting={isDeleting}
          />
        </div>
      </HRMSContentLayout>
    </AppLayout>
  );
}
