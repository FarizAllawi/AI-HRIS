import { Badge } from '@/components/ui/badge';
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconEye,
  IconId,
  IconMapPin,
} from '@tabler/icons-react';

type Props = {
  jobPosting: {
    id: string;
    dateCreated: string;
    publishedStatus: string;
    employmentType?: string;
    location?: string;
    department?: string;
  };
};

export default function JobOverview({ jobPosting }: Props) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getEmploymentTypeBadge = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'intern':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatBadgeText = (text: string) => {
    return text
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <IconEye className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <h3 className="text-lg font-semibold">Job Overview</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconId className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium">Job ID</span>
          </div>
          <span className="font-mono text-sm text-muted-foreground">
            {jobPosting.id}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconCalendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-medium">Created</span>
          </div>
          <span className="text-sm">
            {new Date(jobPosting.dateCreated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconEye className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <Badge variant={getStatusBadgeVariant(jobPosting.publishedStatus)}>
            {formatBadgeText(jobPosting.publishedStatus || 'Draft')}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconBriefcase className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <span className="text-sm font-medium">Employment Type</span>
          </div>
          {jobPosting.employmentType ? (
            <Badge
              className={getEmploymentTypeBadge(jobPosting.employmentType)}
            >
              {formatBadgeText(jobPosting.employmentType)}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">Not specified</span>
          )}
        </div>

        {jobPosting.location && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconMapPin className="h-4 w-4 text-red-500 dark:text-red-400" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <span className="text-sm">{jobPosting.location}</span>
          </div>
        )}

        {jobPosting.department && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconBuilding className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-sm font-medium">Department</span>
            </div>
            <span className="text-sm">{jobPosting.department}</span>
          </div>
        )}
      </div>
    </div>
  );
}
