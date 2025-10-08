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
import { ActionButtons } from './action-buttons';
import { Link } from '@inertiajs/react';

export function JobPostingTable({
  jobPostings,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
}: JobPostingTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: JobPosting['publishedStatus']) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Job Posting ID</TableHead>
            <TableHead>Job Posting Title</TableHead>
            <TableHead className="w-[140px]">Date Created</TableHead>
            <TableHead className="w-[120px]">Published Status</TableHead>
            <TableHead className="w-[120px]">Total Applicants</TableHead>
            <TableHead className="w-[200px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobPostings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No job postings found.
              </TableCell>
            </TableRow>
          ) : (
            jobPostings.map((jobPosting) => (
              <TableRow key={jobPosting.id}>
                <TableCell className="font-medium">
                  {jobPosting.id}
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/HRIS/job-posting/${jobPosting.id}`} className="hover:underline">
                    {jobPosting.title}
                  </Link>
                </TableCell>
                <TableCell>
                  {formatDate(jobPosting.dateCreated)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(jobPosting.publishedStatus)}
                </TableCell>
                <TableCell>
                  {jobPosting.totalApplicants ?? 0}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <ActionButtons
                      jobPosting={jobPosting}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleStatus={onToggleStatus}
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
