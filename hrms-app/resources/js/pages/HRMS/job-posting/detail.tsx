// detail.tsx - Fixed mobile layout
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AiScreeningProgress from '@/components/HRMS/job-posting/detail/AiScreeningProgress';
import ApplicantCard from '@/components/HRMS/job-posting/ApplicantCard';
import JobOverview from '@/components/HRMS/job-posting/detail/JobOverview';
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
  IconArchive,
  IconWorldUpload,
  IconWorldDownload,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import JobQuestions from '@/components/HRMS/job-posting/detail/JobQuestions';
import { Briefcase } from 'lucide-react';

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

type QuestionItem = {
  id?: string;
  question: string;
  desciption: string;
  weight: string;
  mapped_compentencies: string[]
}

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
    questions?: QuestionItem[];
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
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_review' | 'approved' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'applicants'>('details');

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

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  }

  const handleStatusAction = (action: string) => {
    console.log(`${action} job posting`, jobPosting.id);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Job Posting — ${jobPosting.title}`} />
      <HRMSContentLayout
        iconTitle={<Briefcase className="w-6 h-6 text-white"/> }
        title={jobPosting.title}
        description={`${jobPosting.department ?? ''} ${jobPosting.location ? `• ${jobPosting.location}` : ''} ${jobPosting.employmentType ? `• ${jobPosting.employmentType}` : ''}`.trim()}
      >
        {/* Mobile-first Statistics Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center space-x-2">
              <IconUsers className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Applications</span>
            </div>
            <div className="mt-1 text-lg font-bold">
              {jobPosting.statistics?.totalApplications ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {jobPosting.statistics?.applicationsToday ?? 0} today
            </p>
          </div>

          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center space-x-2">
              <IconBrain className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium">AI Progress</span>
            </div>
            <div className="mt-1 text-lg font-bold">
              {jobPosting.aiProgress?.screeningProgress ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {jobPosting.aiProgress?.aiScreenedCount ?? 0} screened
            </p>
          </div>

          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium">Approved</span>
            </div>
            <div className="mt-1 text-lg font-bold text-green-600">
              {jobPosting.aiProgress?.approvedCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Ready</p>
          </div>

          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-xs font-medium">Avg Score</span>
            </div>
            <div className="mt-1 text-lg font-bold">
              {jobPosting.statistics?.averageScore ? formatScore(jobPosting.statistics.averageScore) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Overall</p>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="mb-4 lg:hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <IconLayoutGrid className="h-4 w-4 mx-auto mb-1" />
              <span className="text-xs">Job Details</span>
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'applicants'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <IconUsers className="h-4 w-4 mx-auto mb-1" />
              <span className="text-xs">Applicants ({jobPosting.applicants?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Status and Actions - Mobile Optimized */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                jobPosting.publishedStatus === 'published'
                  ? 'default'
                  : jobPosting.publishedStatus === 'archived'
                    ? 'secondary'
                    : 'outline'
              }
              className="text-xs"
            >
              {formatBadgeText(jobPosting.publishedStatus || '')}
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Created {new Date(jobPosting.dateCreated).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2">
            {jobPosting.publishedStatus === 'published' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs sm:flex-none sm:text-sm"
                  onClick={() => handleStatusAction('unpublish')}
                >
                  <IconWorldDownload className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Unpublish</span>
                  <span className="sm:hidden">Unpublish</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 text-xs sm:flex-none sm:text-sm"
                  onClick={() => handleStatusAction('archive')}
                >
                  <IconArchive className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                  <span>Archive</span>
                </Button>
              </>
            ) : jobPosting.publishedStatus === 'archived' ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs sm:flex-none sm:text-sm"
                onClick={() => handleStatusAction('unarchive')}
              >
                <IconWorldUpload className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Unarchive</span>
                <span className="sm:hidden">Restore</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-xs sm:flex-none sm:text-sm"
                onClick={() => handleStatusAction('publish')}
              >
                <IconWorldUpload className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                <span>Publish</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              {/* Job Details */}
              <div className="space-y-4">
                <JobOverview jobPosting={jobPosting} />
                <JobQuestions jobPosting={jobPosting} />
              </div>

              {/* Analytics Cards for Mobile */}
              <div className="space-y-4">
                <AiScreeningProgress aiProgress={jobPosting.aiProgress} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TopAiRankings aiRankings={jobPosting.aiRankings} />
                  <TopCandidates rankings={jobPosting.rankings} />
                </div>
              </div>


            </div>
          ) : (
            /* Applicants Tab */
            <div className="space-y-4">
              {/* Filters */}
              <div className="rounded-xl border bg-white p-4 dark:bg-gray-900">
                <div className="space-y-3">
                  <Input
                    placeholder="🔍 Search applicants..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-11 w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={(value: 'all' | 'new' | 'in_review' | 'approved' | 'rejected') => setStatusFilter(value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">{formatBadgeText('new')}</SelectItem>
                        <SelectItem value="in_review">{formatBadgeText('in_review')}</SelectItem>
                        <SelectItem value="approved">{formatBadgeText('approved')}</SelectItem>
                        <SelectItem value="rejected">{formatBadgeText('rejected')}</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={timeRange}
                      onValueChange={(value: 'all' | 'today' | '7d' | '30d') => setTimeRange(value)}
                    >
                      <SelectTrigger className="h-11">
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
              </div>

              {/* Applicants Count */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Applicants ({filteredApplicants.length})
                </h3>
                <Badge variant="secondary">
                  {filteredApplicants.length} of {jobPosting.applicants?.length || 0}
                </Badge>
              </div>

              {/* Applicants List */}
              <div className="space-y-3">
                {filteredApplicants.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-12 dark:border-gray-700 dark:bg-gray-800/30">
                    <IconUsers className="mb-3 h-12 w-12 text-gray-400" />
                    <h4 className="mb-1 text-base font-semibold text-gray-600 dark:text-gray-400">
                      No applicants found
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-500 text-center px-4">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <div key={applicant.id}>
                      <ApplicantCard applicant={applicant} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
       <div className="hidden lg:flex lg:flex-col gap-6">
         <div className="grid grid-cols-2 gap-6">
           {/* Left Column - Job Details */}
           <div className="space-y-6">
             <JobOverview jobPosting={jobPosting} />
             <JobQuestions jobPosting={jobPosting} />
           </div>

           {/* Right Column - Analytics & Applications */}
           <div className="space-y-6">
             {/* Analytics Cards */}
             <div className="grid gap-6">
               <AiScreeningProgress aiProgress={jobPosting.aiProgress} />
               <div className="grid gap-6 md:grid-cols-2">
                 <TopAiRankings aiRankings={jobPosting.aiRankings} />
                 <TopCandidates rankings={jobPosting.rankings} />
               </div>
             </div>
           </div>

         </div>
         {/* All Applications Section */}
         <div className="rounded-xl border bg-gradient-to-br from-slate-50/50 via-gray-50/30 to-zinc-50/50 p-6 dark:from-slate-950/20 dark:via-gray-950/15 dark:to-zinc-950/20">
           <div className="mb-6 flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="rounded-lg bg-gradient-to-r from-slate-500 to-gray-600 p-2">
                 <IconUsers className="h-5 w-5 text-white" />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                   All Applications
                 </h3>
                 <p className="text-sm text-muted-foreground">
                   {filteredApplicants.length} of {jobPosting.applicants?.length || 0} applicants
                 </p>
               </div>
             </div>
             <div className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2">
                  <span className="text-lg font-bold text-white">
                    {filteredApplicants.length}
                  </span>
             </div>
           </div>

           {/* Filters */}
           <div className="mb-6 space-y-3">
             <Input
               placeholder="🔍 Search by name or email..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="h-11 w-full"
             />
             <div className="flex gap-3">
               <Select
                 value={statusFilter}
                 onValueChange={(value: 'all' | 'new' | 'in_review' | 'approved' | 'rejected') => setStatusFilter(value)}
               >
                 <SelectTrigger className="h-11 flex-1">
                   <SelectValue placeholder="Status" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Status</SelectItem>
                   <SelectItem value="new">{formatBadgeText('new')}</SelectItem>
                   <SelectItem value="in_review">{formatBadgeText('in_review')}</SelectItem>
                   <SelectItem value="approved">{formatBadgeText('approved')}</SelectItem>
                   <SelectItem value="rejected">{formatBadgeText('rejected')}</SelectItem>
                 </SelectContent>
               </Select>

               <Select
                 value={timeRange}
                 onValueChange={(value: 'all' | 'today' | '7d' | '30d') => setTimeRange(value)}
               >
                 <SelectTrigger className="h-11 flex-1">
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

           {/* Applicants List */}
           <div className="space-y-4">
             {filteredApplicants.length === 0 ? (
               <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-12 dark:border-gray-700 dark:bg-gray-800/30">
                 <IconUsers className="mb-3 h-12 w-12 text-gray-400" />
                 <h4 className="mb-1 text-base font-semibold text-gray-600 dark:text-gray-400">
                   No applicants found
                 </h4>
                 <p className="text-sm text-gray-500 dark:text-gray-500 text-center px-4">
                   Try adjusting your search criteria or filters
                 </p>
               </div>
             ) : (
               filteredApplicants.map((applicant) => (
                 <div key={applicant.id}>
                   <ApplicantCard applicant={applicant} />
                 </div>
               ))
             )}
           </div>
         </div>
       </div>
      </HRMSContentLayout>
    </AppLayout>
  );
}
