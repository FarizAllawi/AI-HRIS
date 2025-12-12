import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from '@inertiajs/react';
import {
  IconDotsVertical,
  IconExternalLink,
  IconSearch,
  IconFilter
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import type {
  ApplicantRecord,
  ApplicantTableHandlers,
  ApplicationStatus,
  InterviewStatus,
  InterviewType,
} from './types';
import {
  formatDate,
  formatDateTime,
  getInterviewStatusBadge,
  getInterviewTypeLabel,
  getResponseBadge,
} from './utils';
import { Calendar, Video } from 'lucide-react';

type Props = { items: ApplicantRecord[] } & ApplicantTableHandlers;

export function ApplicantTable({ items, onView, onInvite, onSchedule }: Props) {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<InterviewStatus | 'all'>('all');
  const [type, setType] = useState<InterviewType | 'all'>('all');
  const [appStatus, setAppStatus] = useState<ApplicationStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchQuery =
        q === '' ||
        it.fullName.toLowerCase().includes(q) ||
        it.positionTitle.toLowerCase().includes(q) ||
        (it.positionCode?.toLowerCase().includes(q) ?? false);
      const matchStatus =
        status === 'all' ? true : it.interviewStatus === status;
      const matchType =
        type === 'all' ? true : (it.interviewType ?? 'tbd') === type;
      const matchAppStatus =
        appStatus === 'all'
          ? true
          : (it.applicationStatus ?? 'new') === appStatus;
      return matchQuery && matchStatus && matchType && matchAppStatus;
    });
  }, [items, query, status, type, appStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paged = filtered.slice(startIndex, startIndex + pageSize);

  const resetToFirst = () => setPage(1);

  // Enhanced mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Enhanced Search & Filters */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl p-4 border dark:border-gray-700">
          <div className="relative mb-3">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search applicants, positions..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirst();
              }}
              className="pl-10 bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as InterviewStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white">
                <div className="flex items-center gap-2">
                  <IconFilter className="h-4 w-4" />
                  <SelectValue placeholder="Interview Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-gray-300 dark:focus:bg-gray-700">All Interview</SelectItem>
                <SelectItem value="invited" className="dark:text-gray-300 dark:focus:bg-gray-700">Invited</SelectItem>
                <SelectItem value="scheduled" className="dark:text-gray-300 dark:focus:bg-gray-700">Scheduled</SelectItem>
                <SelectItem value="completed" className="dark:text-gray-300 dark:focus:bg-gray-700">Completed</SelectItem>
                <SelectItem value="no_show" className="dark:text-gray-300 dark:focus:bg-gray-700">No Show</SelectItem>
                <SelectItem value="cancelled" className="dark:text-gray-300 dark:focus:bg-gray-700">Cancelled</SelectItem>
                <SelectItem value="proposed" className="dark:text-gray-300 dark:focus:bg-gray-700">Proposed</SelectItem>
                <SelectItem value="tbd" className="dark:text-gray-300 dark:focus:bg-gray-700">TBD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center px-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {filtered.length} applicants found
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              resetToFirst();
            }}
          >
            <SelectTrigger className="w-28 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="10" className="dark:text-gray-300 dark:focus:bg-gray-700">10 / page</SelectItem>
              <SelectItem value="20" className="dark:text-gray-300 dark:focus:bg-gray-700">20 / page</SelectItem>
              <SelectItem value="50" className="dark:text-gray-300 dark:focus:bg-gray-700">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Mobile Cards */}
        {paged.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/20 rounded-2xl border dark:border-gray-700">
            <div className="text-gray-400 dark:text-gray-500 text-lg mb-2">No applicants found</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search filters</div>
          </div>
        ) : (
          <div className="space-y-3">
            {paged.map((it) => (
              <div
                key={it.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800"
              >
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                      {it.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{it.fullName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Applied {formatDate(it.applicationDate)}
                      </div>
                    </div>
                  </div>
                  {getInterviewStatusBadge(it.interviewStatus)}
                </div>

                {/* Position Info */}
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="font-medium text-gray-900 dark:text-white">{it.positionTitle}</div>
                  {it.positionCode && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">#{it.positionCode}</div>
                  )}
                </div>

                {/* Interview Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(it.interviewDateTime) || 'Not scheduled'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Video className="h-4 w-4" />
                      <span>{getInterviewTypeLabel(it.interviewType)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Response:</span>{' '}
                      {getResponseBadge(it.candidateResponse)}
                    </div>
                    {it.interviewers && it.interviewers?.length > 0 && (
                      <div className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{it.interviewers.length}</span> interviewer(s)
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                    onClick={() => onView?.(it)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                    onClick={() => onSchedule?.(it)}
                  >
                    Schedule
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="border-gray-200 dark:border-gray-600 dark:text-gray-300">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
                      <DropdownMenuItem
                        onClick={() => onView?.(it)}
                        className="cursor-pointer dark:text-gray-300 dark:focus:bg-gray-700"
                      >
                        View Full Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onInvite?.(it)}
                        className="cursor-pointer dark:text-gray-300 dark:focus:bg-gray-700"
                      >
                        Send Invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onSchedule?.(it)}
                        className="cursor-pointer dark:text-gray-300 dark:focus:bg-gray-700"
                      >
                        Schedule Interview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Page {safePage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Desktop Table View
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-950/20 rounded-t-2xl p-6 border-b dark:border-gray-700">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search applicants, positions, codes..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirst();
              }}
              className="pl-10 bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as InterviewStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Interview Status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-gray-300 dark:focus:bg-gray-700">All Interview</SelectItem>
                <SelectItem value="invited" className="dark:text-gray-300 dark:focus:bg-gray-700">Invited</SelectItem>
                <SelectItem value="scheduled" className="dark:text-gray-300 dark:focus:bg-gray-700">Scheduled</SelectItem>
                <SelectItem value="completed" className="dark:text-gray-300 dark:focus:bg-gray-700">Completed</SelectItem>
                <SelectItem value="no_show" className="dark:text-gray-300 dark:focus:bg-gray-700">No Show</SelectItem>
                <SelectItem value="cancelled" className="dark:text-gray-300 dark:focus:bg-gray-700">Cancelled</SelectItem>
                <SelectItem value="proposed" className="dark:text-gray-300 dark:focus:bg-gray-700">Proposed</SelectItem>
                <SelectItem value="tbd" className="dark:text-gray-300 dark:focus:bg-gray-700">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as InterviewType | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[150px] bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-gray-300 dark:focus:bg-gray-700">All Types</SelectItem>
                <SelectItem value="phone" className="dark:text-gray-300 dark:focus:bg-gray-700">Phone</SelectItem>
                <SelectItem value="video" className="dark:text-gray-300 dark:focus:bg-gray-700">Video</SelectItem>
                <SelectItem value="in_person" className="dark:text-gray-300 dark:focus:bg-gray-700">In-Person</SelectItem>
                <SelectItem value="tbd" className="dark:text-gray-300 dark:focus:bg-gray-700">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={appStatus}
              onValueChange={(v) => {
                setAppStatus(v as ApplicationStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all" className="dark:text-gray-300 dark:focus:bg-gray-700">All Applications</SelectItem>
                <SelectItem value="new" className="dark:text-gray-300 dark:focus:bg-gray-700">New</SelectItem>
                <SelectItem value="in_review" className="dark:text-gray-300 dark:focus:bg-gray-700">In Review</SelectItem>
                <SelectItem value="rejected" className="dark:text-gray-300 dark:focus:bg-gray-700">Rejected</SelectItem>
                <SelectItem value="hired" className="dark:text-gray-300 dark:focus:bg-gray-700">Hired</SelectItem>
                <SelectItem value="withdrawn" className="dark:text-gray-300 dark:focus:bg-gray-700">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[130px] bg-white dark:bg-gray-800 border-0 shadow-sm dark:text-white dark:border-gray-700">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="10" className="dark:text-gray-300 dark:focus:bg-gray-700">10 / page</SelectItem>
                <SelectItem value="20" className="dark:text-gray-300 dark:focus:bg-gray-700">20 / page</SelectItem>
                <SelectItem value="50" className="dark:text-gray-300 dark:focus:bg-gray-700">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Showing {filtered.length === 0 ? 0 : startIndex + 1}‑
            {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} applicants
          </div>
          {filtered.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
              Sorted by: Application Date
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
            <TableHead className="font-semibold text-gray-900 dark:text-white">Applicant</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-white">Application Date</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-white">Position</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
            <TableHead className="font-semibold text-gray-900 dark:text-white text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <div className="text-lg mb-2">No applicants found</div>
                  <div className="text-sm">Try adjusting your search criteria</div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paged.map((it) => (
              <TableRow
                key={it.id}
                className="group hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                      {it.fullName.charAt(0)}
                    </div>
                    <div>
                      {it.profileUrl ? (
                        <Link
                          href={it.profileUrl}
                          className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                          {it.fullName}
                          <IconExternalLink className="inline size-3 text-blue-500 dark:text-blue-400" />
                        </Link>
                      ) : (
                        <span className="font-semibold text-gray-900 dark:text-white">{it.fullName}</span>
                      )}
                      {it.contactEmail && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{it.contactEmail}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(it.applicationDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{it.positionTitle}</span>
                    {it.positionCode && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full inline-block w-fit mt-1">
                        #{it.positionCode}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getInterviewStatusBadge(it.interviewStatus)}
                    {it.applicationStatus && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {it.applicationStatus.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors group-hover:border-blue-300 dark:group-hover:border-blue-700 dark:text-gray-300"
                        >
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
                        <DropdownMenuItem
                          onClick={() => onView?.(it)}
                          className="cursor-pointer text-blue-600 dark:text-blue-400 focus:text-blue-600 dark:focus:text-blue-400 dark:focus:bg-gray-700"
                        >
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onInvite?.(it)}
                          className="cursor-pointer text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400 dark:focus:bg-gray-700"
                        >
                          Send Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onSchedule?.(it)}
                          className="cursor-pointer text-purple-600 dark:text-purple-400 focus:text-purple-600 dark:focus:text-purple-400 dark:focus:bg-gray-700"
                        >
                          Schedule Interview
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Enhanced Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Page {safePage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ApplicantTable;
