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
            className="border-green-200 bg-green-100 text-green-800"
          >
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge
            variant="secondary"
            className="border-yellow-200 bg-yellow-100 text-yellow-800"
          >
            Draft
          </Badge>
        );
      case 'unpublish':
        return (
          <Badge
            variant="secondary"
            className="border-red-200 bg-red-100 text-red-800"
          >
            Unpublished
          </Badge>
        );
      case 'archived':
        return (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-100 text-gray-800"
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
            className="border-blue-200 bg-blue-100 text-blue-800"
          >
            Full Time
          </Badge>
        );
      case 'contract':
        return (
          <Badge
            variant="secondary"
            className="border-purple-200 bg-purple-100 text-purple-800"
          >
            Contract
          </Badge>
        );
      case 'part-time':
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-100 text-orange-800"
          >
            Part Time
          </Badge>
        );
      case 'internship':
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-100 text-amber-800"
          >
            Internship
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Posting Title</TableHead>
            <TableHead className="w-[120px]">Type of Job</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead className="w-[140px]">Date Created</TableHead>
            <TableHead className="w-[120px]">Total Applicants</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[200px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobPostings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="text-base font-medium">
                    No job postings found
                  </div>
                  <div className="text-sm">
                    Try adjusting your filters or create a new job posting
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            jobPostings?.map((jobPosting) => (
              <TableRow key={jobPosting.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/HRMS/job-posting/${jobPosting.id}${jobPosting.status === 'draft' ? '/edit' : ''}`}
                    className="hover:underline"
                  >
                    {jobPosting.title}
                  </Link>
                </TableCell>
                <TableCell>{getTypeBadge(jobPosting.type)}</TableCell>
                <TableCell>{jobPosting.salary}</TableCell>
                <TableCell>{formatDate(jobPosting.created_at)}</TableCell>
                <TableCell>{jobPosting.totalApplicants ?? 0}</TableCell>
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
  );
}
