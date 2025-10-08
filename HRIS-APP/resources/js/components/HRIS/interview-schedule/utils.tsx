import { IconClock } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import type { InterviewStatus, InterviewType } from './types';

export function formatDateTime(dateString?: string | null) {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  try {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'TBD';
  }
}

export function formatDateTimeLong(dateString?: string | null) {
  if (!dateString) return 'Date/time not set yet. Awaiting scheduling or proposal.';
  const date = new Date(dateString);
  try {
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return dateString ?? '';
  }
}

export function getTypeTooltip(type?: InterviewType) {
  switch (type) {
    case 'phone':
      return 'Phone interview — conducted via voice call.';
    case 'video':
      return 'Video interview — conducted via Zoom/Meet/Teams link.';
    case 'in_person':
      return 'In-person interview — at office or specified location.';
    case 'tbd':
      return 'Interview type is to be determined.';
    default:
      return 'Interview type not specified.';
  }
}

export function getStatusBadge(status: InterviewStatus) {
  switch (status) {
    case 'invited':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Invited</Badge>;
    case 'candidate_proposed':
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Candidate Proposed</Badge>;
    case 'scheduled':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>;
    case 'today':
      return (
        <Badge className="bg-violet-100 text-violet-800 border-violet-200">
          <IconClock className="mr-1 inline size-3" /> Today
        </Badge>
      );
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case 'no_show':
      return <Badge className="bg-red-100 text-red-800 border-red-200">No Show</Badge>;
    case 'cancelled':
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
    case 'reschedule_requested':
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Reschedule Requested</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function getStatusTooltip(status: InterviewStatus) {
  switch (status) {
    case 'invited':
      return 'Invited – Awaiting candidate response.';
    case 'candidate_proposed':
      return 'Candidate proposed an alternate date/time.';
    case 'scheduled':
      return 'Interview confirmed by both parties.';
    case 'today':
      return 'Happening today. Join or manage this interview.';
    case 'completed':
      return 'Interview completed. Ensure feedback is recorded.';
    case 'no_show':
      return 'Marked as no-show. Consider rescheduling or closing.';
    case 'cancelled':
      return 'Interview cancelled. You can reinitiate when ready.';
    case 'reschedule_requested':
      return 'Reschedule requested by candidate or interviewer.';
    default:
      return String(status);
  }
}


