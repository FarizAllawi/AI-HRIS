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
import { IconDotsVertical, IconExternalLink } from '@tabler/icons-react';
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

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-3 border-b p-3">
          <div className="flex w-full gap-2 md:max-w-md">
            <Input
              placeholder="Search applicant or position..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirst();
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as InterviewStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Interview Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interview</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="proposed">Proposed</SelectItem>
                <SelectItem value="tbd">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as InterviewType | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="tbd">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={appStatus}
              onValueChange={(v) => {
                setAppStatus(v as ApplicationStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {paged.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No applicants found.
          </div>
        ) : (
          paged.map((it) => (
            <div key={it.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    Applied {formatDate(it.applicationDate)} •{' '}
                    {it.positionTitle}
                  </div>
                </div>
                {getInterviewStatusBadge(it.interviewStatus)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    Interview:
                  </span>{' '}
                  {formatDateTime(it.interviewDateTime)}
                </div>
                <div>
                  <span className="font-medium text-foreground">Type:</span>{' '}
                  {getInterviewTypeLabel(it.interviewType)}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Interviewer(s):
                  </span>{' '}
                  {it.interviewers?.join(', ') || '–'}
                </div>
                <div>
                  <span className="font-medium text-foreground">Response:</span>{' '}
                  {getResponseBadge(it.candidateResponse)}
                </div>
              </div>
              <div className="mt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <IconDotsVertical className="size-4" />
                      <span className="sr-only">Open actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(it)}>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInvite?.(it)}>
                      Send Invite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSchedule?.(it)}>
                      Schedule Interview
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
        <div className="flex items-center justify-between gap-2 border-t p-3 text-sm">
          <div className="text-muted-foreground">
            Page {safePage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-2 md:max-w-md">
            <Input
              placeholder="Search applicant or position..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirst();
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as InterviewStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Interview Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interview</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="proposed">Proposed</SelectItem>
                <SelectItem value="tbd">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as InterviewType | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="tbd">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={appStatus}
              onValueChange={(v) => {
                setAppStatus(v as ApplicationStatus | 'all');
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                resetToFirst();
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filtered.length === 0 ? 0 : startIndex + 1}‑
          {Math.min(startIndex + pageSize, filtered.length)} of{' '}
          {filtered.length}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Application Date</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Links</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No applicants found.
              </TableCell>
            </TableRow>
          ) : (
            paged.map((it) => (
              <TableRow key={it.id}>
                <TableCell>
                  {it.profileUrl ? (
                    <Link href={it.profileUrl} className="hover:underline">
                      {it.fullName}
                      <IconExternalLink className="ml-1 inline size-3 align-[-2px]" />
                    </Link>
                  ) : (
                    <span className="font-medium">{it.fullName}</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(it.applicationDate)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{it.positionTitle}</span>
                    {it.positionCode ? (
                      <span className="text-xs text-muted-foreground">
                        {it.positionCode}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {it.contactEmail ? <span>{it.contactEmail}</span> : null}
                    {it.contactPhone ? (
                      <span className="text-xs text-muted-foreground">
                        {it.contactPhone}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {it.resumeUrl ? (
                      <a
                        href={it.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Resume
                      </a>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <IconDotsVertical className="size-4" />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(it)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInvite?.(it)}>
                          Send Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSchedule?.(it)}>
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
      <div className="flex items-center justify-between gap-2 border-t p-3 text-sm">
        <div className="text-muted-foreground">
          Page {safePage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ApplicantTable;
