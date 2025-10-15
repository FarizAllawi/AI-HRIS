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
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className="h-8 w-8 cursor-pointer p-0"
        title="View Details"
      >
        <IconEye className="h-4 w-4" />
      </Button>

      {jobPosting.status === 'published' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUnpublish}
            className="h-8 w-8 p-0"
            title="Unpublish"
          >
            <IconToggleRight className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="h-8 w-8 p-0"
            title="Archive"
          >
            <IconArchive className="h-4 w-4 text-orange-600" />
          </Button>
        </>
      )}

      {jobPosting.status === 'unpublish' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 cursor-pointer p-0"
            title="Edit Job Posting"
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStatus}
            className="h-8 w-8 p-0"
            title="Publish"
          >
            <IconToggleLeft className="h-4 w-4 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            className="h-8 w-8 p-0"
            title="Archive"
          >
            <IconArchive className="h-4 w-4 text-orange-600" />
          </Button>
        </>
      )}

      {jobPosting.status === 'draft' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 cursor-pointer p-0"
            title="Edit Job Posting"
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStatus}
            className="h-8 w-8 p-0"
            title="Publish"
          >
            <IconToggleLeft className="h-4 w-4 text-gray-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
          className="h-8 w-8 p-0"
          title="Unarchive"
        >
          <IconArchiveOff className="h-4 w-4 text-blue-600" />
        </Button>
      )}
    </div>
  );
}
