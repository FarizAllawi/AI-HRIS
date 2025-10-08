import { IconEye, IconEdit, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { JobPosting } from '@/types/job-posting';

interface ActionButtonsProps {
  jobPosting: JobPosting;
  onView?: (jobPosting: JobPosting) => void;
  onEdit?: (jobPosting: JobPosting) => void;
  onDelete?: (jobPosting: JobPosting) => void;
  onToggleStatus?: (jobPosting: JobPosting) => void;
}

export function ActionButtons({
  jobPosting,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: ActionButtonsProps) {
  const handleView = () => {
    onView?.(jobPosting);
  };

  const handleEdit = () => {
    onEdit?.(jobPosting);
  };

  const handleDelete = () => {
    onDelete?.(jobPosting);
  };

  const handleToggleStatus = () => {
    onToggleStatus?.(jobPosting);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className="h-8 w-8 p-0"
        title="View Details"
      >
        <IconEye className="h-4 w-4" />
      </Button>
      {jobPosting.publishedStatus === 'published' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleStatus}
          className="h-8 w-8 p-0"
          title="Unpublish"
        >
          <IconToggleRight className="h-4 w-4 text-green-600" />
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
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
    </div>
  );
}
