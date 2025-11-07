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
      `/HRMS/job-posting/${jobPosting.id}/archived`,
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
        title="Job Posting"
        description="Manage and track all job postings in your organization."
        createTitle="Create New Job Posting"
        onCreateNew={handleCreateNew}
      >
        <div className="w-full space-y-6">
          {/* Filters */}
          <div className="w-full">
            <JobPostingFiltersComponent
              jobPostings={jobPostings || []}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Header with View Toggle */}
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground font-medium">
              {getFilterSummary()}
            </p>

            <div className="flex items-center gap-3">
              {Object.values(activeFilters).some((value) => value !== '') && (
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full shadow-sm">
                  Filters Active
                </span>
              )}

              {/* Enhanced View Toggle */}
              <div className="flex items-center gap-1 border rounded-xl p-1 bg-gray-50 dark:bg-gray-800 shadow-sm">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 shadow-sm border text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current rounded"></div>
                    Table
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-gray-700 shadow-sm border text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
                    Cards
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="w-full">
            {viewMode === 'table' ? (
              <div className="hidden lg:block overflow-hidden">
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
            ) : (
              <JobPostingCardView
                jobPostings={filteredJobPostings}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onArchive={handleArchive}
                onUnpublish={handleUnpublish}
              />
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
