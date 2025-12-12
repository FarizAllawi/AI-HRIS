// job-posting-table.tsx
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { JobPosting, JobPostingTableProps } from '@/types/job-posting';
import { Link } from '@inertiajs/react';
import { ActionButtons } from './action-buttons';
import { IconCalendar, IconUsers, IconCurrencyDollar } from '@tabler/icons-react';

export function JobPostingTable({
                                  jobPostings,
                                  onEdit,
                                  onDelete,
                                  onView,
                                  onToggleStatus,
                                  onArchive,
                                  onUnpublish,
                                }: JobPostingTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: JobPosting['status']) => {
    switch (status) {
      case 'published':
        return (
          <Badge
            variant="default"
            className="border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
          >
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge
            variant="secondary"
            className="border-yellow-200 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
          >
            Draft
          </Badge>
        );
      case 'unpublish':
        return (
          <Badge
            variant="secondary"
            className="border-red-200 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
          >
            Unpublished
          </Badge>
        );
      case 'archived':
        return (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
          >
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: JobPosting['type']) => {
    switch (type) {
      case 'full-time':
        return (
          <Badge
            variant="default"
            className="border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
          >
            Full Time
          </Badge>
        );
      case 'contract':
        return (
          <Badge
            variant="secondary"
            className="border-purple-200 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
          >
            Contract
          </Badge>
        );
      case 'part-time':
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
          >
            Part Time
          </Badge>
        );
      case 'internship':
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
          >
            Internship
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm dark:bg-gray-900/50">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Job Posting Title</TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
              <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Salary</TableHead>
              <TableHead className="w-[140px] font-semibold text-gray-900 dark:text-gray-100">Date Created</TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-gray-100">Applicants</TableHead>
              <TableHead className="w-[120px] font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
              <TableHead className="w-[200px] text-center font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobPostings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                      <IconCalendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="text-base font-medium">
                      No job postings found
                    </div>
                    <div className="text-sm max-w-sm text-center">
                      Try adjusting your filters or create a new job posting
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              jobPostings?.map((jobPosting) => (
                <TableRow
                  key={jobPosting.id}
                  className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200 border-b dark:border-gray-800"
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/HRMS/job-posting/${jobPosting.id}${jobPosting.status === 'draft' ? '/edit' : ''}`}
                      className="hover:underline font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      {jobPosting.title}
                    </Link>
                    {jobPosting.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {jobPosting.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{getTypeBadge(jobPosting.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconCurrencyDollar className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium">{jobPosting.salary}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{formatDate(jobPosting.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconUsers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold">{jobPosting.totalApplicants ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(jobPosting.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <ActionButtons
                        jobPosting={jobPosting}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                        onArchive={onArchive}
                        onUnpublish={onUnpublish}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
