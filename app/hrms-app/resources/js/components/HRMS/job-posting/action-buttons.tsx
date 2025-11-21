// action-buttons.tsx
import { Button } from '@/components/ui/button';
import { useJobPostingToasts } from '@/hooks/use-job-posting-toasts';
import { JobPosting } from '@/types/job-posting';
import {
  IconArchive,
  IconArchiveOff,
  IconEdit,
  IconEye,
  IconToggleLeft,
  IconToggleRight,
  IconTrash,
} from '@tabler/icons-react';

interface ActionButtonsProps {
  jobPosting: JobPosting;
  onView?: (jobPosting: JobPosting) => void;
  onEdit?: (jobPosting: JobPosting) => void;
  onDelete?: (jobPosting: JobPosting) => void;
  onToggleStatus?: (jobPosting: JobPosting) => void;
  onArchive?: (jobPosting: JobPosting) => void;
  onUnpublish?: (jobPosting: JobPosting) => void;
}

export function ActionButtons({
                                jobPosting,
                                onView,
                                onEdit,
                                onDelete,
                                onToggleStatus,
                                onArchive,
                                onUnpublish,
                              }: ActionButtonsProps) {
  const { showInfo } = useJobPostingToasts();

  const handleView = () => {
    showInfo(
      'Opening job posting',
      `Loading details for "${jobPosting.title}"`,
    );
    onView?.(jobPosting);
  };

  const handleEdit = () => {
    showInfo('Opening editor', `Preparing to edit "${jobPosting.title}"`);
    onEdit?.(jobPosting);
  };

  const handleDelete = () => {
    onDelete?.(jobPosting);
  };

  const handleToggleStatus = () => {
    onToggleStatus?.(jobPosting);
  };

  const handleArchive = () => {
    onArchive?.(jobPosting);
  };

  const handleUnpublish = () => {
    onUnpublish?.(jobPosting);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className="h-8 w-8 cursor-pointer p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
        title="View Details"
      >
        <IconEye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </Button>

      {jobPosting.status === 'published' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnpublish}
            className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
            title="Unpublish"
          >
            <IconToggleRight className="h-4 w-4 text-green-600 dark:text-green-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Archive"
          >
            <IconArchive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </Button>
        </>
      )}

      {jobPosting.status === 'unpublish' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 cursor-pointer p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit Job Posting"
          >
            <IconEdit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStatus}
            className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            title="Publish"
          >
            <IconToggleLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Archive"
          >
            <IconArchive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </Button>
        </>
      )}

      {jobPosting.status === 'draft' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 cursor-pointer p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit Job Posting"
          >
            <IconEdit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStatus}
            className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            title="Publish"
          >
            <IconToggleLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            title="Delete Job Posting"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        </>
      )}

      {jobPosting.status === 'archived' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleStatus}
          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title="Unarchive"
        >
          <IconArchiveOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </Button>
      )}
    </div>
  );
}
