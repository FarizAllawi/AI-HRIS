export interface JobPosting {
  id: string;
  title: string;
  dateCreated: string;
  publishedStatus: 'published' | 'draft' | 'archived';
  description?: string;
  department?: string;
  location?: string;
  salary?: string;
  requirements?: string[];
  benefits?: string[];
  totalApplicants?: number;
}

export interface JobPostingTableProps {
  jobPostings: JobPosting[];
  onEdit?: (jobPosting: JobPosting) => void;
  onDelete?: (jobPosting: JobPosting) => void;
  onView?: (jobPosting: JobPosting) => void;
  onToggleStatus?: (jobPosting: JobPosting) => void;
}

