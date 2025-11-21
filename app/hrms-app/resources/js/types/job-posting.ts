export interface JobPosting {
  id: string;
  title: string;
  created_at: string;
  status: 'published' | 'unpublish' | 'draft' | 'archived';
  type: 'full-time' | 'contract' | 'part-time' | 'internship';
  description?: string;
  department?: string;
  location?: string;
  salary?: string;
  benefits: Array<{ value: string }>;
  requirements: Array<{ value: string }>;
  responsibilities: Array<{ value: string }>;
//   requirements?: string[];
//   benefits?: string[];
//   responsibilities: string[];
  totalApplicants?: number;
  questions?: JobPostingQuestions[];
}

export interface JobPostingQuestions {
  id: string;
  job_posting_id: string;
  question: string;
  weight: number;
}

export interface JobPostingFilters {
  search: string;
  status: string;
  type: string;
  department: string;
  location: string;
  dateRange: string;
  applicantRange: string;
}

export interface JobPostingTableProps {
  jobPostings: JobPosting[];
  onEdit?: (jobPosting: JobPosting) => void;
  onDelete?: (jobPosting: JobPosting) => void;
  onView?: (jobPosting: JobPosting) => void;
  onToggleStatus?: (jobPosting: JobPosting) => void;
  onArchive?: (jobPosting: JobPosting) => void;
  onUnpublish?: (jobPosting: JobPosting) => void;
}
