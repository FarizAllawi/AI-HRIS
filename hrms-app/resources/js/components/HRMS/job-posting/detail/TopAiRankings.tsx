import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconBrain, IconHash,
  IconMailPlus,
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
    if (rank === 1) return <IconTrophy className="h-8 w-8 mt-1 text-secondary" />;
    if (rank <= 3) return <IconSparkles className="h-8 w-8 text-secondary" />;
    if (rank <= 15) return <IconBrain className="h-8 w-8 text-secondary" />;
    return <IconHash className="h-8 w-8 text-secondary" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-yellow-600';
    return 'bg-gradient-to-r from-blue-500 to-purple-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-purple-600 dark:text-purple-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1); // round to 2 decimal places
  }

  console.log("aiRangkings:", aiRankings);

  return (
    <div className="rounded-lg border bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 p-6 dark:from-indigo-950/20 dark:via-purple-950/15 dark:to-pink-950/20">
      <div className="mb-6 flex items-center space-x-3">
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5">
          <IconRobot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
            Top by AI Screening
          </h3>
          <p className="text-sm text-muted-foreground">
            AI-powered candidate rankings
          </p>
        </div>
      </div>

      {!aiRankings || aiRankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <IconBrain className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No AI rankings available yet.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Rankings will appear after AI screening.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {aiRankings.slice(0, 5).map((a) => (
            <div
              key={a.applicantId}
              className="group relative overflow-hidden rounded-xl border bg-gradient-to-r from-white/80 to-gray-50/80 p-4 transition-all hover:shadow-lg hover:shadow-purple-100/50 dark:from-gray-900/80 dark:to-gray-800/80 dark:hover:shadow-purple-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-purple-900/10"></div>

              <div className="relative flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${getRankBadgeColor(a.aiRank)} shadow-lg`}>
                    <div className="absolute z-10 opacity-30">{getRankIcon(a.aiRank)}</div>
                    <div className="z-20 text-sm font-bold text-white">{a.aiRank}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {a.avatarUrl ? (
                    <div className="relative">
                      <img
                        src={a.avatarUrl}
                        alt={a.fullName}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-200/50 transition-transform group-hover:scale-105 dark:ring-purple-800/50"
                      />
                      {a.aiRank <= 3 && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-sm"></div>
                      )}
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 ring-2 ring-purple-200/50 transition-transform group-hover:scale-105 dark:from-purple-800 dark:to-pink-800 dark:ring-purple-800/50" />
                  )}

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {a.fullName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>Applied {a.applicationDate}</span>
                      {a.status && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="h-5 text-[10px]">
                            {formatBadgeText(a.status)}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-1">
                          <IconBrain className="h-4 w-4 text-purple-500" />
                          <span
                            className={`text-lg font-bold ${getScoreColor(a.aiScore ? parseFloat(formatScore(a.aiScore)) : 0)}`}
                          >
                            {a?.aiScore ? formatScore(a.aiScore) : '–'}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          AI Score
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      AI Screening Score: {a?.aiScore ? formatScore(a.aiScore) : 0}
                    </TooltipContent>
                  </Tooltip>

                  <div className="flex space-x-2">
                    {a.applicantId && (
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
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:from-purple-600 hover:to-pink-600"
                          onClick={() =>
                            console.log('Invite AI-ranked candidate', a.applicantId)
                          }
                        >
                          <IconMailPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Invite to interview</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
