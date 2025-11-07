import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconBrain,
  IconHash,
  IconRobot,
  IconSparkles,
  IconTrophy,
} from '@tabler/icons-react';

type AiRanking = {
  applicantId: string;
  fullName: string;
  aiScore?: number;
  avatarUrl?: string;
  aiRank: number;
  status?: string;
  applicationDate?: string;
  profileUrl?: string;
};

type Props = {
  aiRankings?: AiRanking[];
};

export default function TopAiRankings({ aiRankings }: Props) {
  const formatBadgeText = (text: string) => {
    return text
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <IconTrophy className="h-4 w-4 text-yellow-500" />;
    if (rank <= 3) return <IconSparkles className="h-4 w-4 text-purple-500" />;
    return <IconHash className="h-3 w-3 text-gray-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-purple-600 dark:text-purple-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 p-4 md:p-6 dark:from-indigo-950/20 dark:via-purple-950/15 dark:to-pink-950/20">
      <div className="mb-4 flex items-center space-x-3 md:mb-6">
        <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-2 md:rounded-xl md:p-2.5">
          <IconRobot className="h-4 w-4 text-white md:h-5 md:w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 md:text-lg">
            Top AI Rankings
          </h3>
          <p className="text-xs text-muted-foreground md:text-sm">
            AI-powered candidate rankings
          </p>
        </div>
      </div>

      {!aiRankings || aiRankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6">
          <IconBrain className="mb-2 h-8 w-8 text-muted-foreground/50 md:h-10 md:w-10" />
          <p className="text-sm text-muted-foreground text-center">
            No AI rankings available yet
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {aiRankings.slice(0, 10).map((a) => (
            <div
              key={a.applicantId}
              className="flex items-center space-x-3 rounded-lg border bg-white/80 p-3 dark:bg-gray-900/80 md:rounded-xl md:p-4"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg md:h-10 md:w-10">
                  <div className="text-xs font-bold text-white md:text-sm">{a.aiRank}</div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100 text-sm md:text-base">
                    {a.fullName}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <IconBrain className="h-3 w-3 text-purple-500" />
                      <span className={`text-xs font-bold ${getScoreColor(a.aiScore ? parseFloat(formatScore(a.aiScore)) : 0)}`}>
                        {a?.aiScore ? formatScore(a.aiScore) : '–'}
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
          ))}
        </div>
      )}
    </div>
  );
}
