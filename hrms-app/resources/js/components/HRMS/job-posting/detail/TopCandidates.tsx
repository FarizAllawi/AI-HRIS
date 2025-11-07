import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconBrain,
  IconCrown,
  IconMailPlus,
  IconStar,
  IconTrophy,
  IconUser,
} from '@tabler/icons-react';

type Candidate = {
  applicantId: string;
  fullName: string;
  aiScore?: number;
  hrScore?: number;
  finalScore?: number;
  avatarUrl?: string;
  rank: number;
  status?: string;
  applicationDate?: string;
  profileUrl?: string;
};

type Props = {
  rankings?: Candidate[];
};

export default function TopCandidates({ rankings }: Props) {
  const formatBadgeText = (text: string) => {
    return text
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <IconCrown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <IconTrophy className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <IconStar className="h-4 w-4 text-orange-500" />;
    return <IconUser className="h-3 w-3 text-gray-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 65) return 'text-purple-600 dark:text-purple-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-fuchsia-50/50 p-4 md:p-6 dark:from-rose-950/20 dark:via-pink-950/15 dark:to-fuchsia-950/20">
      <div className="mb-4 flex items-center space-x-3 md:mb-6">
        <div className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 p-2 md:rounded-xl md:p-2.5">
          <IconCrown className="h-4 w-4 text-white md:h-5 md:w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 md:text-lg">
            Top Candidates
          </h3>
          <p className="text-xs text-muted-foreground md:text-sm">
            Combined AI + HR rankings
          </p>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6">
          <IconTrophy className="mb-2 h-8 w-8 text-muted-foreground/50 md:h-10 md:w-10" />
          <p className="text-sm text-muted-foreground text-center">
            No rankings available yet
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {rankings.slice(0, 10).map((a) => (
            <div
              key={a.applicantId}
              className="flex items-center space-x-3 rounded-lg border bg-white/80 p-3 dark:bg-gray-900/80 md:rounded-xl md:p-4"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg md:h-10 md:w-10">
                  <div className="text-xs font-bold text-white md:text-sm">{a.rank}</div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">
                    {a.fullName}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <IconBrain className="h-3 w-3 text-purple-500" />
                      <span className={`text-xs font-bold ${getScoreColor(a.aiScore || 0)}`}>
                        {a?.aiScore ? formatScore(a.aiScore) : '–'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <IconUser className="h-3 w-3 text-blue-500" />
                      <span className={`text-xs font-bold ${getScoreColor(a.hrScore || 0)}`}>
                        {typeof a.hrScore === 'number' ? a.hrScore : '–'}
                      </span>
                    </div>
                    {a.status && (
                      <Badge variant="outline" className="h-4 text-[10px]">
                        {formatBadgeText(a.status)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  asChild
                >
                  <a href={`/HRMS/applicant/${a.applicantId}`} target="_blank" rel="noreferrer">
                    View
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
