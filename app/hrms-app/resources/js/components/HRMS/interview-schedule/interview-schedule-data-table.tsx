import { ActionsSheet } from '@/components/HRMS/interview-schedule/actions-sheet';
import {
  FeedbackCell,
  InterviewersCell,
} from '@/components/HRMS/interview-schedule/cells';
import type {
  InterviewScheduleTableProps,
  InterviewStatus,
  InterviewType,
} from '@/components/HRMS/interview-schedule/types';
import {
  formatDateTime,
  formatDateTimeLong,
  getStatusBadge,
  getStatusTooltip,
  getTypeTooltip,
} from '@/components/HRMS/interview-schedule/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IconExternalLink } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

export function InterviewScheduleDataTable({
  items,
  ...handlers
}: InterviewScheduleTableProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>(
    'all',
  );
  const [typeFilter, setTypeFilter] = useState<InterviewType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchQuery =
        q === '' ||
        it.candidateName.toLowerCase().includes(q) ||
        it.positionTitle.toLowerCase().includes(q) ||
        (it.positionCode?.toLowerCase().includes(q) ?? false);
      const matchStatus =
        statusFilter === 'all' ? true : it.status === statusFilter;
      const matchType =
        typeFilter === 'all'
          ? true
          : (it.interviewType ?? 'tbd') === typeFilter;
      return matchQuery && matchStatus && matchType;
    });
  }, [items, query, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="rounded-md border">
      <div className="flex flex-col gap-3 border-b p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full gap-2 md:max-w-md">
            <Input
              placeholder="Search candidate, position, or code..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirstPage();
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as InterviewStatus | 'all');
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="candidate_proposed">
                  Candidate Proposed
                </SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="reschedule_requested">
                  Reschedule Requested
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as InterviewType | 'all');
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="in_person">In‑person</SelectItem>
                <SelectItem value="tbd">TBD</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                resetToFirstPage();
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filteredItems.length === 0 ? 0 : startIndex + 1}‑
          {Math.min(startIndex + pageSize, filteredItems.length)} of{' '}
          {filteredItems.length}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Candidate</span>
                </TooltipTrigger>
                <TooltipContent>
                  Applicant name — click to open profile.
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Position</span>
                </TooltipTrigger>
                <TooltipContent>
                  Job title and optional job code.
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="w-[180px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Date & Time</span>
                </TooltipTrigger>
                <TooltipContent>
                  Scheduled interview time in your local timezone.
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="w-[100px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Type</span>
                </TooltipTrigger>
                <TooltipContent>
                  Phone, Video, In‑person, or TBD.
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Interviewer(s)</span>
                </TooltipTrigger>
                <TooltipContent>Assigned HR or hiring managers.</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="w-[140px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Status</span>
                </TooltipTrigger>
                <TooltipContent>
                  Current interview stage (color‑coded).
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="w-[120px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Feedback</span>
                </TooltipTrigger>
                <TooltipContent>Feedback submitted or pending.</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="w-[260px] text-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>Actions</span>
                </TooltipTrigger>
                <TooltipContent>
                  Contextual actions based on status.
                </TooltipContent>
              </Tooltip>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No interviews found.
              </TableCell>
            </TableRow>
          ) : (
            pagedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={item.candidateAvatarUrl ?? undefined}
                        alt={item.candidateName}
                      />
                      <AvatarFallback>
                        {item.candidateName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {item.candidateProfileUrl ? (
                      <a
                        href={item.candidateProfileUrl}
                        className="hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.candidateName}
                        <IconExternalLink className="ml-1 inline size-3 align-[-2px]" />
                      </a>
                    ) : (
                      <span className="font-medium">{item.candidateName}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.positionTitle}</span>
                    {item.positionCode ? (
                      <span className="text-xs text-muted-foreground">
                        {item.positionCode}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{formatDateTime(item.interviewDateTime)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formatDateTimeLong(item.interviewDateTime)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="capitalize">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        {item.interviewType
                          ? item.interviewType.replace('_', ' ')
                          : '–'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {getTypeTooltip(item.interviewType)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <InterviewersCell interviewers={item.interviewers} />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{getStatusBadge(item.status)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {getStatusTooltip(item.status)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <FeedbackCell feedbackStatus={item.feedbackStatus} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <ActionsSheet
                      item={item}
                      handlers={handlers}
                      title={
                        item.status === 'invited'
                          ? 'Actions — Invited'
                          : item.status === 'candidate_proposed'
                            ? 'Actions — Candidate Proposed'
                            : item.status === 'scheduled'
                              ? 'Actions — Scheduled'
                              : item.status === 'today'
                                ? 'Actions — Today'
                                : item.status === 'completed'
                                  ? 'Actions — Completed'
                                  : item.status === 'no_show'
                                    ? 'Actions — No Show'
                                    : item.status === 'cancelled'
                                      ? 'Actions — Cancelled'
                                      : item.status === 'reschedule_requested'
                                        ? 'Actions — Reschedule Requested'
                                        : 'Actions'
                      }
                    />
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

export default InterviewScheduleDataTable;
