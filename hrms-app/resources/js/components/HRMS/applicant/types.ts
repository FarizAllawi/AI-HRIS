export type InterviewStatus =
  | "invited"
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled"
  | "proposed"
  | "tbd";

export type CandidateResponse = "accepted" | "proposed" | "no_response" | "declined";

export type InterviewType = "phone" | "video" | "in_person" | "tbd";

export type ApplicationStatus = "new" | "in_review" | "rejected" | "hired" | "withdrawn";

export interface ApplicantRecord {
  id: string;
  fullName: string;
  applicationDate: string; // ISO date
  positionTitle: string;
  positionCode?: string;
  interviewStatus: InterviewStatus;
  interviewDateTime?: string; // ISO datetime
  interviewType?: InterviewType;
  interviewLocationOrLink?: string;
  interviewers?: string[];
  candidateResponse?: CandidateResponse;
  contactEmail?: string;
  contactPhone?: string;
  profileUrl?: string;
  resumeUrl?: string;
  applicationStatus?: ApplicationStatus;
  feedbackStatus?: "pending" | "submitted" | "n/a";
  resumeScore?: number; // 0-100
  referralSource?: string;
}

export interface ApplicantTableHandlers {
  onView?: (applicant: ApplicantRecord) => void;
  onSchedule?: (applicant: ApplicantRecord) => void;
  onInvite?: (applicant: ApplicantRecord) => void;
}


