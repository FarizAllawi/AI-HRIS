export type InterviewStatus =
  | 'invited'
  | 'candidate_proposed'
  | 'scheduled'
  | 'today'
  | 'completed'
  | 'no_show'
  | 'cancelled'
  | 'reschedule_requested';

export type InterviewType = 'phone' | 'video' | 'in_person' | 'tbd';

export interface Interviewer {
  id: string | number;
  name: string;
  avatarUrl?: string | null;
}

export interface InterviewScheduleItem {
  id: string | number;
  candidateName: string;
  candidateProfileUrl?: string;
  candidateAvatarUrl?: string | null;
  positionTitle: string;
  positionCode?: string;
  interviewDateTime?: string | null;
  status: InterviewStatus;
  interviewers?: Interviewer[];
  interviewType?: InterviewType;
  locationOrLink?: string;
  candidateResponse?: 'accepted' | 'proposed' | 'not_responded';
  ownerName?: string;
  feedbackStatus?: 'submitted' | 'pending' | 'none';
  notes?: string;
  updatedAt?: string;
}

export interface InterviewScheduleTableProps {
  items: InterviewScheduleItem[];
  onView?: (item: InterviewScheduleItem) => void;
  onReschedule?: (item: InterviewScheduleItem) => void;
  onCancel?: (item: InterviewScheduleItem) => void;
  onJoin?: (item: InterviewScheduleItem) => void;
  onAddFeedback?: (item: InterviewScheduleItem) => void;
  onReviewProposal?: (item: InterviewScheduleItem) => void;
  onApproveProposal?: (item: InterviewScheduleItem) => void;
  onSuggestAnotherTime?: (item: InterviewScheduleItem) => void;
  onResendInvitation?: (item: InterviewScheduleItem) => void;
  onEditInvitation?: (item: InterviewScheduleItem) => void;
  onMarkCompleted?: (item: InterviewScheduleItem) => void;
  onReinitiate?: (item: InterviewScheduleItem) => void;
}
