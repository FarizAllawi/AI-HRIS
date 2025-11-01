import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AiScreeningProgress from '@/components/HRMS/job-posting/detail/AiScreeningProgress';
import ApplicantCard from '@/components/HRMS/job-posting/ApplicantCard';
import JobDescription from '@/components/HRMS/job-posting/detail/JobDescription';
import JobOverview from '@/components/HRMS/job-posting/detail/JobOverview';
import JobRequirements from '@/components/HRMS/job-posting/detail/JobRequirements';
import JobQualifications from '@/components/HRMS/job-posting/detail/JobQualifications';
import JobPreferredSkills from '@/components/HRMS/job-posting/detail/JobPreferredSkills';
import JobRequiredSkills from '@/components/HRMS/job-posting/detail/JobRequiredSkills';
import JobResponsibilities from '@/components/HRMS/job-posting/detail/JobResponsibilities';
import TopAiRankings from '@/components/HRMS/job-posting/detail/TopAiRankings';
import TopCandidates from '@/components/HRMS/job-posting/detail/TopCandidates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
  IconBrain,
  IconCurrencyDollar,
  IconGift,
  IconUsers,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';

// Utility function to format badge text
const formatBadgeText = (text: string) => {
  return text
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

type ArrayItem = {
  id: string;
  value: string;
}

type Applicant = {
  id: string;
  applicantId: string;
  fullName: string;
  email: string;
  phone?: string;
  applicationDate: string;
  applicationDateTime: string;
  status: 'new' | 'in_review' | 'approved' | 'rejected';
  resumeScore?: number;
  aiScore?: number;
  hrScore?: number;
  portfolioLink?: string;
  resumeFile?: string;
  profileUrl?: string;
  avatarUrl?: string;
  daysAgo: number;
  isNew: boolean;
};

type RankedApplicant = Applicant & {
  rank: number;
  finalScore: number;
};

type AiRankedApplicant = Applicant & {
  aiRank: number;
};

type Statistics = {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  applicationsToday: number;
  applicationsThisWeek: number;
  totalApplications: number;
  averageScoreText: string;
};

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
    salary?: string;
    requirements?: ArrayItem[];
    responsibilities?: ArrayItem[];
    qualifications?: ArrayItem[];
    required_skills?: ArrayItem[];
    preferred_skills?: ArrayItem[];
    benefits?: ArrayItem[];
    applicants?: Applicant[];
    rankings?: RankedApplicant[];
    aiRankings?: AiRankedApplicant[];
    aiProgress?: {
      totalApplicants: number;
      aiScreenedCount: number;
      aiScreeningCurrent: number;
      pendingScreening: number;
      approvedCount: number;
      rejectedCount: number;
      screeningProgress: number;
    };
    statistics?: Statistics;
  };
};

export default function JobPostingDetail({ jobPosting }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Job Posting', href: '/HRMS/job-posting' },
    { title: jobPosting.title, href: '#' },
  ];

  const [query, setQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d'>(
    'all',
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'new' | 'in_review' | 'approved' | 'rejected'
  >('all');

  const filteredApplicants = useMemo(() => {
    const list = jobPosting.applicants ?? [];
    const q = query.trim().toLowerCase();
    const now = new Date();
    return list.filter((a) => {
      const matchesQuery =
        q === '' ||
        a.fullName.toLowerCase().includes(q) ||
        (a.email && a.email.toLowerCase().includes(q));
      if (!matchesQuery) return false;

      // Status filter
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;

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
  }, [jobPosting.applicants, query, timeRange, statusFilter]);

  console.log("jobPosting", jobPosting);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Job Posting — ${jobPosting.title}`} />
      <HRMSContentLayout
        title={jobPosting.title}
        description={`${jobPosting.department ?? ''} ${jobPosting.location ? `• ${jobPosting.location}` : ''} ${jobPosting.employmentType ? `• ${jobPosting.employmentType}` : ''}`.trim()}
      >
        {/* Statistics Overview */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <IconUsers className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-medium">Total Applications</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {jobPosting.statistics?.totalApplications ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {jobPosting.statistics?.applicationsToday ?? 0} today,{' '}
              {jobPosting.statistics?.applicationsThisWeek ?? 0} this week
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <IconBrain className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              <span className="text-sm font-medium">AI Screening</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {jobPosting.aiProgress?.screeningProgress ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {jobPosting.aiProgress?.aiScreenedCount ?? 0} screened,{' '}
              {jobPosting.aiProgress?.pendingScreening ?? 0} pending
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500 dark:bg-green-400"></div>
              <span className="text-sm font-medium">Approved</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {jobPosting.aiProgress?.approvedCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Ready for interview</p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-orange-500 dark:bg-orange-400"></div>
              <span className="text-sm font-medium">Average Score</span>
            </div>
            <div className="mt-1 text-2xl font-bold">
              {jobPosting.statistics?.averageScoreText ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Range: {jobPosting.statistics?.lowestScore ?? 0}-
              {jobPosting.statistics?.highestScore ?? 0}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <Badge
            variant={
              jobPosting.publishedStatus === 'published'
                ? 'default'
                : 'secondary'
            }
          >
            {formatBadgeText(jobPosting.publishedStatus || '')}
          </Badge>

          <div className="flex gap-2">
            {jobPosting.publishedStatus === 'published' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    console.log('Unpublish job posting', jobPosting.id)
                  }
                >
                  Unpublish
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    // Replace with real archive action
                    // e.g., router.post(route('job-posting.archive', jobPosting.id))
                    console.log('Archive job posting', jobPosting.id);
                  }}
                >
                  Archive
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  console.log('Archive job posting', jobPosting.id)
                }
              >
                Archive
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <JobOverview jobPosting={jobPosting} />
          <JobDescription description={jobPosting.description} />
          <JobRequirements requirements={jobPosting.requirements} />
          <JobResponsibilities responsibilities={jobPosting.responsibilities} />
          <JobQualifications qualifications={jobPosting.qualifications} />
          <JobRequiredSkills required_skills={jobPosting.preferred_skills} />
          <JobPreferredSkills preferred_skills={jobPosting.preferred_skills} />

          {jobPosting.benefits && jobPosting.benefits.length > 0 && (
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center space-x-2">
                <IconGift className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                <h3 className="text-lg font-semibold">Benefits & Perks</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.benefits.length} items
                </Badge>
              </div>

              <div className="space-y-3">
                {jobPosting.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 rounded-md border bg-purple-50/50 p-3 dark:bg-purple-950/20"
                  >
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500 dark:bg-purple-400" />
                    <span className="text-sm leading-relaxed">{benefit.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobPosting.salary && (
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center space-x-2">
                <IconCurrencyDollar className="h-5 w-5 text-green-500 dark:text-green-400" />
                <h3 className="text-lg font-semibold">Compensation</h3>
              </div>

              <div className="rounded-md border bg-green-50/50 p-4 dark:bg-green-950/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {jobPosting.salary}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Base salary range
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
            <AiScreeningProgress aiProgress={jobPosting.aiProgress} />
            <TopAiRankings aiRankings={jobPosting.aiRankings} />
            <TopCandidates rankings={jobPosting.rankings} />
          </div>

          <div className="md:col-span-2">
            <div className="rounded-lg border bg-gradient-to-br from-slate-50/50 via-gray-50/30 to-zinc-50/50 p-6 dark:from-slate-950/20 dark:via-gray-950/15 dark:to-zinc-950/20">
              <div className="mb-6 flex items-center space-x-3">
                <div className="rounded-xl bg-gradient-to-r from-slate-500 to-gray-600 p-2.5">
                  <IconUsers className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-xl font-bold text-transparent dark:from-slate-300 dark:to-gray-300">
                    All Applications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredApplicants.length} of{' '}
                    {jobPosting.applicants?.length || 0} applicants shown
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 shadow-lg">
                  <span className="text-lg font-bold text-white">
                    {filteredApplicants.length}
                  </span>
                </div>
              </div>

              <div className="mb-6 rounded-xl border bg-white/80 p-4 shadow-sm dark:bg-gray-900/80">
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-64 flex-1">
                    <Input
                      placeholder="🔍 Search by name or email..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-11 border-2 border-gray-200 bg-gray-50/50 text-base transition-all focus:border-blue-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:focus:border-blue-500 dark:focus:bg-gray-800"
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onValueChange={(
                      value:
                        | 'all'
                        | 'new'
                        | 'in_review'
                        | 'approved'
                        | 'rejected',
                    ) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="h-11 w-40 border-2 border-gray-200 bg-gray-50/50 transition-all hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">
                        {formatBadgeText('new')}
                      </SelectItem>
                      <SelectItem value="in_review">
                        {formatBadgeText('in_review')}
                      </SelectItem>
                      <SelectItem value="approved">
                        {formatBadgeText('approved')}
                      </SelectItem>
                      <SelectItem value="rejected">
                        {formatBadgeText('rejected')}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={timeRange}
                    onValueChange={(value: 'all' | 'today' | '7d' | '30d') =>
                      setTimeRange(value)
                    }
                  >
                    <SelectTrigger className="h-11 w-40 border-2 border-gray-200 bg-gray-50/50 transition-all hover:bg-white dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredApplicants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-16 dark:border-gray-700 dark:bg-gray-800/30">
                    <IconUsers className="mb-4 h-16 w-16 text-gray-400" />
                    <h4 className="mb-2 text-lg font-semibold text-gray-600 dark:text-gray-400">
                      No applicants found
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                ) : (
                  filteredApplicants.map((applicant, index) => (
                    <div
                      key={applicant.id}
                      className="group relative transform transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.5s ease-out forwards',
                      }}
                    >
                      <ApplicantCard applicant={applicant} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </HRMSContentLayout>
    </AppLayout>
  );
}
