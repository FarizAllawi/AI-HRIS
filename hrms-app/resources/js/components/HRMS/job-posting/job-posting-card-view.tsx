import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { JobPosting, JobPostingTableProps } from '@/types/job-posting';
import { Link } from '@inertiajs/react';
import {
  IconUsers,
  IconCalendar,
  IconCurrencyDollar,
  IconMapPin,
  IconBuilding,
  IconEye,
  IconEdit,
  IconArchive,
  IconWorldUpload,
  IconWorldDownload,
  IconTrash,
  IconSparkles
} from '@tabler/icons-react';

export function JobPostingCardView({
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
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/25 dark:shadow-green-600/25 px-3 py-1">
            <IconSparkles className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-lg shadow-amber-500/25 dark:shadow-amber-600/25 px-3 py-1">
            Draft
          </Badge>
        );
      case 'unpublish':
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-lg shadow-orange-500/25 dark:shadow-orange-600/25 px-3 py-1">
            Unpublished
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 text-white border-0 shadow-lg shadow-gray-500/25 dark:shadow-gray-600/25 px-3 py-1">
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
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800 backdrop-blur-sm">
            💼 Full Time
          </Badge>
        );
      case 'contract':
        return (
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800 backdrop-blur-sm">
            📝 Contract
          </Badge>
        );
      case 'part-time':
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800 backdrop-blur-sm">
            ⏱️ Part Time
          </Badge>
        );
      case 'internship':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800 backdrop-blur-sm">
            🎓 Internship
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusActions = (jobPosting: JobPosting) => {
    switch (jobPosting.status) {
      case 'published':
        return (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnpublish?.(jobPosting)}
              className="flex-1 text-xs border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30 transition-all duration-200"
            >
              <IconWorldDownload className="h-3 w-3 mr-1" />
              Unpublish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onArchive?.(jobPosting)}
              className="flex-1 text-xs border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <IconArchive className="h-3 w-3 mr-1" />
              Archive
            </Button>
          </div>
        );
      case 'draft':
        return (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(jobPosting)}
              className="flex-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <IconEdit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onToggleStatus?.(jobPosting)}
              className="flex-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 dark:shadow-green-600/25 transition-all duration-200"
            >
              <IconWorldUpload className="h-3 w-3 mr-1" />
              Publish
            </Button>
          </div>
        );
      case 'unpublish':
        return (
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(jobPosting)}
              className="flex-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <IconEdit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onToggleStatus?.(jobPosting)}
              className="flex-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 dark:shadow-green-600/25 transition-all duration-200"
            >
              <IconWorldUpload className="h-3 w-3 mr-1" />
              Publish
            </Button>
          </div>
        );
      case 'archived':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus?.(jobPosting)}
            className="w-full text-xs mt-3 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200"
          >
            <IconWorldUpload className="h-3 w-3 mr-1" />
            Restore
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {jobPostings.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900/20 border-0 shadow-2xl">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 shadow-2xl">
                <div className="text-3xl">🚀</div>
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                No job postings found
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                Try adjusting your search filters or create a new job posting to get started
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        jobPostings?.map((jobPosting) => (
          <Card
            key={jobPosting.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm"
          >
            {/* Gradient accent border */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/HRMS/job-posting/${jobPosting.id}${jobPosting.status === 'draft' ? '/edit' : ''}`}
                    className="hover:underline transition-all duration-200"
                  >
                    <h3 className="font-bold text-xl leading-tight truncate bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-500">
                      {jobPosting.title}
                    </h3>
                  </Link>
                  {jobPosting.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {jobPosting.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {getStatusBadge(jobPosting.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4 space-y-4 relative z-10">
              {/* Info Grid with improved styling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {jobPosting.location && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <IconMapPin className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</div>
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{jobPosting.location}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <IconUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Applicants</div>
                    <div className="font-bold text-gray-900 dark:text-white">{jobPosting.totalApplicants ?? 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <IconCurrencyDollar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Salary</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{jobPosting.salary || 'Not specified'}</div>
                  </div>
                </div>

                {jobPosting.department && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <IconBuilding className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</div>
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{jobPosting.department}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with type and date */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {getTypeBadge(jobPosting.type)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800">
                    <IconCalendar className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Created {formatDate(jobPosting.created_at)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 relative z-10">
              <div className="flex flex-col w-full gap-3">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView?.(jobPosting)}
                    className="flex-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200 group/btn"
                  >
                    <IconEye className="h-3 w-3 mr-1 transition-transform group-hover/btn:scale-110" />
                    View Details
                  </Button>

                  {jobPosting.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete?.(jobPosting)}
                      className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-all duration-200 group/btn"
                    >
                      <IconTrash className="h-3 w-3 transition-transform group-hover/btn:scale-110" />
                    </Button>
                  )}
                </div>

                {/* Status-specific actions */}
                {getStatusActions(jobPosting)}
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
