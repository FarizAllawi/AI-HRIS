import { toast } from 'sonner';

export const useJobPostingToasts = () => {
  // Success toasts
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000, // 4 seconds for success messages
    });
  };

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000, // 5 seconds for error messages
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000, // 3 seconds for info messages
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000, // 4 seconds for warning messages
    });
  };

  // Job posting specific toasts
  const jobPosting = {
    created: (title: string) => {
      showSuccess(
        'Job posting created successfully',
        `"${title}" has been saved as draft`,
      );
    },

    updated: (title: string) => {
      showSuccess(
        'Job posting updated successfully',
        `"${title}" has been updated with your changes`,
      );
    },

    published: (title: string) => {
      showSuccess(
        'Job posting published successfully',
        `"${title}" is now live and accepting applications`,
      );
    },

    unpublished: (title: string) => {
      showInfo(
        'Job posting unpublished',
        `"${title}" has been removed from public listings`,
      );
    },

    archived: (title: string) => {
      showSuccess(
        'Job posting archived successfully',
        `"${title}" has been moved to archives`,
      );
    },

    unarchived: (title: string) => {
      showSuccess(
        'Job posting restored successfully',
        `"${title}" has been restored from archives`,
      );
    },

    deleted: (title: string) => {
      showSuccess(
        'Job posting deleted successfully',
        `"${title}" has been permanently removed`,
      );
    },

    deleteError: (title: string, error?: string) => {
      showError(
        'Failed to delete job posting',
        error || `Could not delete "${title}". Please try again.`,
      );
    },

    publishError: (title: string, error?: string) => {
      showError(
        'Failed to publish job posting',
        error || `Could not publish "${title}". Please try again.`,
      );
    },

    updateError: (title: string, error?: string) => {
      showError(
        'Failed to update job posting',
        error || `Could not update "${title}". Please try again.`,
      );
    },

    archiveError: (title: string, error?: string) => {
      showError(
        'Failed to archive job posting',
        error || `Could not archive "${title}". Please try again.`,
      );
    },

    // Action started toasts
    actionStarted: {
      deleting: (title: string) => {
        showInfo('Deleting job posting...', `Removing "${title}"`);
      },

      publishing: (title: string) => {
        showInfo('Publishing job posting...', `Making "${title}" live`);
      },

      unpublishing: (title: string) => {
        showInfo(
          'Unpublishing job posting...',
          `Removing "${title}" from listings`,
        );
      },

      archiving: (title: string) => {
        showInfo('Archiving job posting...', `Moving "${title}" to archives`);
      },

      unarchiving: (title: string) => {
        showInfo(
          'Restoring job posting...',
          `Restoring "${title}" from archives`,
        );
      },
    },
  };

  // Filter toasts
  const filters = {
    applied: (count: number, total: number) => {
      if (count === 0) {
        showWarning(
          'No results found',
          'Try adjusting your filters to see more job postings',
        );
      } else if (count < total) {
        showInfo(
          `Showing ${count} of ${total} job postings`,
          'Filters have been applied',
        );
      }
    },

    cleared: () => {
      showInfo('Filters cleared', 'Showing all job postings');
    },

    searchResults: (count: number, query: string) => {
      if (count === 0) {
        showWarning(
          'No search results',
          `No job postings found matching "${query}"`,
        );
      } else {
        showInfo(
          `Found ${count} result${count === 1 ? '' : 's'}`,
          `Matching "${query}"`,
        );
      }
    },
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,

    jobPosting,
    filters,
  };
};

export type JobPostingToasts = ReturnType<typeof useJobPostingToasts>;
