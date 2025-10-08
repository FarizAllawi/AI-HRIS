import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InterviewStatus, InterviewType } from './types';

export function FiltersHeader({
  query,
  onQuery,
  statusFilter,
  onStatus,
  typeFilter,
  onType,
  pageSize,
  onPageSize,
  showingText,
}: {
  query: string;
  onQuery: (value: string) => void;
  statusFilter: InterviewStatus | 'all';
  onStatus: (value: InterviewStatus | 'all') => void;
  typeFilter: InterviewType | 'all';
  onType: (value: InterviewType | 'all') => void;
  pageSize: number;
  onPageSize: (value: number) => void;
  showingText: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full gap-2 md:max-w-md">
          <Input
            placeholder="Search candidate, position, or code..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => onStatus(v as InterviewStatus | 'all')}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="candidate_proposed">Candidate Proposed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="reschedule_requested">Reschedule Requested</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => onType(v as InterviewType | 'all')}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="in_person">In‑person</SelectItem>
              <SelectItem value="tbd">TBD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
            <SelectTrigger className="w-[110px]"><SelectValue placeholder="Rows" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{showingText}</div>
    </div>
  );
}


