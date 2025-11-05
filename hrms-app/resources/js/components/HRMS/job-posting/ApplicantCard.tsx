import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Utility function to format badge text
const formatBadgeText = (text: string) => {
  return text
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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

type Props = {
  applicant: Applicant;
};

export default function ApplicantCard({ applicant }: Props) {

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1); // round to 2 decimal places
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-white/95 to-gray-50/95 p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-blue-100/50 dark:from-gray-900/95 dark:to-gray-800/95 dark:hover:shadow-blue-900/20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-blue-900/10"></div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <img
              src={applicant.avatarUrl}
              alt={applicant.fullName}
              className="h-14 w-14 rounded-full object-cover ring-3 ring-blue-200/50 transition-all duration-300 group-hover:scale-110 group-hover:ring-blue-300/80 dark:ring-blue-800/50 dark:group-hover:ring-blue-700/80"
            />
            {applicant.isNew && (
              <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm ring-2 ring-white dark:ring-gray-900"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-center space-x-3">
              <h4 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
                {applicant.fullName}
              </h4>
              {applicant.isNew && (
                <Badge className="animate-pulse bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm">
                  ✨ New
                </Badge>
              )}
              <Badge className={getStatusColor(applicant.status)}>
                {formatBadgeText(applicant.status)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <span>📧</span>
                <span>{applicant.email}</span>
              </span>
              {applicant.phone && (
                <span className="flex items-center space-x-1">
                  <span>📱</span>
                  <span>{applicant.phone}</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <span>📅</span>
                <span>
                  Applied{' '}
                  {(() => {
                    const days = Math.floor(Number(applicant.daysAgo ?? 0));
                    if (days <= 0) return 'today';
                    return `${days} day${days > 1 ? 's' : ''} ago`;
                  })()}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            {applicant.aiScore && (
              <div className="flex flex-col items-center rounded-lg bg-purple-50/80 px-3 py-2 dark:bg-purple-950/30">
                <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  AI Score
                </div>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {applicant?.aiScore ? formatScore(applicant.aiScore) : 0}
                </div>
              </div>
            )}

            {applicant.hrScore && (
              <div className="flex flex-col items-center rounded-lg bg-blue-50/80 px-3 py-2 dark:bg-blue-950/30">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  HR Score
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {applicant.hrScore}%
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {applicant.portfolioLink && (
              <Button
                variant="outline"
                size="sm"
                className="group/btn transition-all hover:border-transparent hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white"
                asChild
              >
                <a
                  href={applicant.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 Portfolio
                </a>
              </Button>
            )}

            {applicant.resumeFile && (
              <Button
                variant="outline"
                size="sm"
                className="group/btn transition-all hover:border-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white"
                asChild
              >
                <a
                  href={applicant.resumeFile}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Resume
                </a>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-slate-600 to-gray-600 shadow-md transition-all hover:from-slate-700 hover:to-gray-700 hover:shadow-lg"
              asChild
            >
              <a href={`/HRMS/applicant/${applicant.applicantId}`}>👤 View Profile</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
