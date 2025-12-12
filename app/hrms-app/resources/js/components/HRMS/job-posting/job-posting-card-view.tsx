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
  IconSparkles,
  IconDotsVertical
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
            <IconSparkles className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">Published</span>
            <span className="xs:hidden">Live</span>
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
            <span className="hidden xs:inline">Draft</span>
            <span className="xs:hidden">Draft</span>
          </Badge>
        );
      case 'unpublish':
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
            <span className="hidden xs:inline">Unpublished</span>
            <span className="xs:hidden">Hidden</span>
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-gradient-to-r from-gray-500 to-gray-700 text-white border-0 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm">
            <span className="hidden xs:inline">Archived</span>
            <span className="xs:hidden">Archive</span>
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
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800 backdrop-blur-sm text-xs">
            💼 Full Time
          </Badge>
        );
      case 'contract':
        return (
          <Badge className="bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800 backdrop-blur-sm text-xs">
            📝 Contract
          </Badge>
        );
      case 'part-time':
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800 backdrop-blur-sm text-xs">
            ⏱️ Part Time
          </Badge>
        );
      case 'internship':
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800 backdrop-blur-sm text-xs">
            🎓 Internship
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getMobileActions = (jobPosting: JobPosting) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: IconEye,
        onClick: () => onView?.(jobPosting),
        variant: 'default' as const
      },
      {
        label: 'Edit',
        icon: IconEdit,
        onClick: () => onEdit?.(jobPosting),
        variant: 'outline' as const
      }
    ];

    switch (jobPosting.status) {
      case 'published':
        return [
          ...baseItems,
          {
            label: 'Unpublish',
            icon: IconWorldDownload,
            onClick: () => onUnpublish?.(jobPosting),
            variant: 'outline' as const
          },
          {
            label: 'Archive',
            icon: IconArchive,
            onClick: () => onArchive?.(jobPosting),
            variant: 'outline' as const
          }
        ];
      case 'draft':
      case 'unpublish':
        return [
          ...baseItems,
          {
            label: 'Publish',
            icon: IconWorldUpload,
            onClick: () => onToggleStatus?.(jobPosting),
            variant: 'default' as const
          },
          {
            label: 'Delete',
            icon: IconTrash,
            onClick: () => onDelete?.(jobPosting),
            variant: 'destructive' as const
          }
        ];
      case 'archived':
        return [
          ...baseItems,
          {
            label: 'Restore',
            icon: IconWorldUpload,
            onClick: () => onToggleStatus?.(jobPosting),
            variant: 'default' as const
          }
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {jobPostings.length === 0 ? (
        <Card className="text-center py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900/20 border-0 shadow-xl sm:shadow-2xl mx-2 sm:mx-0">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 sm:p-4 shadow-xl">
                <div className="text-2xl sm:text-3xl">🚀</div>
              </div>
              <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                No job postings found
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xs sm:max-w-md">
                Try adjusting your search filters or create a new job posting to get started
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        jobPostings?.map((jobPosting) => (
          <Card
            key={jobPosting.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm mx-2 sm:mx-0"
          >
            {/* Gradient accent border */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="pb-3 sm:pb-4 relative z-10 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/HRMS/job-posting/${jobPosting.id}${jobPosting.status === 'draft' ? '/edit' : ''}`}
                    className="hover:underline transition-all duration-200 block"
                  >
                    <h3 className="font-bold text-lg sm:text-xl leading-tight line-clamp-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all duration-500">
                      {jobPosting.title}
                    </h3>
                  </Link>
                  {jobPosting.description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 line-clamp-2 leading-relaxed">
                      {jobPosting.description}
                    </p>
                  )}
                </div>
                <div className="flex justify-between xs:justify-end items-center w-full xs:w-auto gap-2">
                  <div className="flex-shrink-0">
                    {getStatusBadge(jobPosting.status)}
                  </div>
                  {/* Mobile dropdown menu */}
                  <div className="xs:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {getMobileActions(jobPosting).map((action, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={action.onClick}
                            className={`flex items-center gap-2 ${
                              action.variant === 'destructive'
                                ? 'text-red-600 focus:text-red-600'
                                : ''
                            }`}
                          >
                            <action.icon className="h-4 w-4" />
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-3 sm:pb-4 space-y-3 sm:space-y-4 relative z-10 px-4 sm:px-6">
              {/* Simplified mobile info grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {jobPosting.location && (
                  <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0">
                      <IconMapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] xs:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Location</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{jobPosting.location}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <IconUsers className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] xs:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Applicants</div>
                    <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{jobPosting.totalApplicants ?? 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                    <IconCurrencyDollar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] xs:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Salary</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{jobPosting.salary || 'Not set'}</div>
                  </div>
                </div>

                {jobPosting.department && (
                  <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                      <IconBuilding className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] xs:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">Department</div>
                      <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{jobPosting.department}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with type and date - mobile optimized */}
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {getTypeBadge(jobPosting.type)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 dark:bg-gray-800">
                    <IconCalendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </div>
                  <span className="font-medium">Created {formatDate(jobPosting.created_at)}</span>
                </div>
              </div>
            </CardContent>

            {/* Desktop Actions Footer - Hidden on mobile */}
            <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/20 relative z-10 px-4 sm:px-6 pb-4 sm:pb-6 hidden xs:block">
              <div className="flex flex-col w-full gap-2 sm:gap-3">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView?.(jobPosting)}
                    className="flex-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 transition-all duration-200"
                  >
                    <IconEye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>

                  {jobPosting.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete?.(jobPosting)}
                      className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 transition-all duration-200"
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Status-specific actions for desktop */}
                {jobPosting.status === 'published' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUnpublish?.(jobPosting)}
                      className="flex-1 text-xs border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30"
                    >
                      <IconWorldDownload className="h-3 w-3 mr-1" />
                      Unpublish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onArchive?.(jobPosting)}
                      className="flex-1 text-xs border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <IconArchive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                  </div>
                )}

                {(jobPosting.status === 'draft' || jobPosting.status === 'unpublish') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(jobPosting)}
                      className="flex-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                    >
                      <IconEdit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onToggleStatus?.(jobPosting)}
                      className="flex-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <IconWorldUpload className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  </div>
                )}

                {jobPosting.status === 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus?.(jobPosting)}
                    className="w-full text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                  >
                    <IconWorldUpload className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
