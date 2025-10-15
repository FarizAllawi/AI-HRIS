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
} from '@/components/HRMS/job-posting';

import { JobPosting, JobPostingFilters } from '@/types/job-posting';
// import { dummyJobPostings } from '@/data/job-postings';

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
      // This shouldn't be called for published jobs as they use separate unpublish handler
      handleUnpublish(jobPosting);
    } else if (jobPosting.status === 'archived') {
      // Unarchive - set back to draft for editing
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
      // Publish draft or unpublished job
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

      // Show filter toast if filters are applied
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

          {/* Results Summary */}
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {getFilterSummary()}
            </p>
            {Object.values(activeFilters).some((value) => value !== '') && (
              <p className="text-xs text-muted-foreground">Filters applied</p>
            )}
          </div>

          {/* Table */}
          <div className="w-full overflow-hidden">
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
