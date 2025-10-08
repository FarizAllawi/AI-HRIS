import HrisContentLayout from '@/components/HRIS/hris-content-Layout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconMailPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IconBrain, IconLoader2, IconUsers } from '@tabler/icons-react';
import JobOverview from '@/components/HRIS/job-posting/JobOverview';
import JobDescription from '@/components/HRIS/job-posting/JobDescription';
import JobRequirements from '@/components/HRIS/job-posting/JobRequirements';
import JobResponsibilities from '@/components/HRIS/job-posting/JobResponsibilities';
import AiScreeningProgress from '@/components/HRIS/job-posting/AiScreeningProgress';
import TopAiRankings from '@/components/HRIS/job-posting/TopAiRankings';
import TopCandidates from '@/components/HRIS/job-posting/TopCandidates';
import RecentApplicants from '@/components/HRIS/job-posting/RecentApplicants';

type Props = {
  jobPosting: {
    id: string;
    title: string;
    dateCreated: string;
    publishedStatus: string;
    description?: string;
    location?: string;
    department?: string;
    employmentType?: string;
    requirements?: string[];
    responsibilities?: string[];
    applicants?: Array<{
      id: string;
      fullName: string;
      applicationDate: string;
      status: string;
      resumeScore?: number;
      profileUrl?: string;
      avatarUrl?: string;
    }>;
    rankings?: Array<{
      id: string;
      fullName: string;
      aiScore?: number;
      hrScore?: number;
      finalScore?: number;
      avatarUrl?: string;
      rank: number;
      status?: string;
      applicationDate?: string;
      profileUrl?: string;
    }>;
    aiRankings?: Array<{
      id: string;
      fullName: string;
      aiScore?: number;
      avatarUrl?: string;
      aiRank: number;
      status?: string;
      applicationDate?: string;
      profileUrl?: string;
    }>;
    aiProgress?: {
      aiScreenedCount: number;
      aiScreeningCurrent: number;
      totalApplicants: number;
    };
  };
}

export default function JobPostingDetail({ jobPosting }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Job Posting', href: '/HRIS/job-posting' },
    { title: jobPosting.title, href: '#' },
  ];

  const [query, setQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d'>('all');

  const filteredApplicants = useMemo(() => {
    const list = jobPosting.applicants ?? [];
    const q = query.trim().toLowerCase();
    const now = new Date();
    return list.filter((a) => {
      const matchesQuery =
        q === '' ||
        a.fullName.toLowerCase().includes(q);
      if (!matchesQuery) return false;
      if (timeRange === 'all') return true;
      const applied = new Date(a.applicationDate);
      if (Number.isNaN(applied.getTime())) return true;
      if (timeRange === 'today') {
        const d = new Date();
        return applied.toDateString() === d.toDateString();
      }
      if (timeRange === '7d') {
        const past = new Date(now);
        past.setDate(past.getDate() - 7);
        return applied >= past && applied <= now;
      }
      if (timeRange === '30d') {
        const past = new Date(now);
        past.setDate(past.getDate() - 30);
        return applied >= past && applied <= now;
      }
      return true;
    });
  }, [jobPosting.applicants, query, timeRange]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Job Posting — ${jobPosting.title}`} />
      <HrisContentLayout
        title={jobPosting.title}
        description={`${jobPosting.department ?? ''} ${jobPosting.location ? `• ${jobPosting.location}` : ''}`.trim()}
      >
        <div className="mb-4 flex items-center justify-end gap-2">
          {jobPosting.publishedStatus === 'published' ? (
            <>
              <Button
                variant="outline"
                onClick={() => console.log('Unpublish job posting', jobPosting.id)}
              >
                Unpublish
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  // Replace with real archive action
                  // e.g., router.post(route('job-posting.archive', jobPosting.id))
                  console.log('Archive job posting', jobPosting.id)
                }}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => console.log('Archive job posting', jobPosting.id)}
            >
              Archive
            </Button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <JobOverview jobPosting={jobPosting} />
          <JobDescription description={jobPosting.description} />
          <JobRequirements requirements={jobPosting.requirements} />
          <JobResponsibilities responsibilities={jobPosting.responsibilities} />

          <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
            <AiScreeningProgress aiProgress={jobPosting.aiProgress} />
            <TopAiRankings aiRankings={jobPosting.aiRankings} />
            <TopCandidates rankings={jobPosting.rankings} />
          </div>

          <RecentApplicants
            applicants={jobPosting.applicants}
            filteredApplicants={filteredApplicants}
            query={query}
            setQuery={setQuery}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
        </div>
      </HrisContentLayout>
    </AppLayout>
  );
}


