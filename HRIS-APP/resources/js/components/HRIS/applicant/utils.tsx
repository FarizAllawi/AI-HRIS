import { Badge } from '@/components/ui/badge';
import type { InterviewStatus, CandidateResponse, ApplicationStatus, InterviewType } from './types';

export function formatDate(dateIso?: string) {
  if (!dateIso) return '–';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString();
}

export function formatDateTime(dateIso?: string) {
  if (!dateIso) return '–';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleString();
}

export function getInterviewStatusBadge(status: InterviewStatus) {
  const map: Record<InterviewStatus, { label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    invited: { label: 'Invited', variant: 'default' },
    scheduled: { label: 'Scheduled', variant: 'default' },
    completed: { label: 'Completed', variant: 'outline' },
    no_show: { label: 'No Show', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'secondary' },
    proposed: { label: 'Proposed', variant: 'secondary' },
    tbd: { label: 'TBD', variant: 'secondary' },
  };
  const conf = map[status];
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

export function getResponseBadge(resp?: CandidateResponse) {
  if (!resp) return '–';
  const map: Record<CandidateResponse, string> = {
    accepted: 'Accepted',
    proposed: 'Proposed',
    no_response: 'No Response',
    declined: 'Declined',
  };
  return map[resp];
}

export function getApplicationStatusLabel(status?: ApplicationStatus) {
  if (!status) return '–';
  const map: Record<ApplicationStatus, string> = {
    new: 'New',
    in_review: 'In Review',
    rejected: 'Rejected',
    hired: 'Hired',
    withdrawn: 'Withdrawn',
  };
  return map[status];
}

export function getInterviewTypeLabel(t?: InterviewType) {
  if (!t) return '–';
  const map: Record<InterviewType, string> = {
    phone: 'Phone',
    video: 'Video',
    in_person: 'In-Person',
    tbd: 'TBD',
  };
  return map[t];
}


