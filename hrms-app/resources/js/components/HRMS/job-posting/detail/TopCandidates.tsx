import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
    if (rank === 1) return <IconCrown className="h-5 w-5 text-secondary" />;
    if (rank === 2) return <IconTrophy className="h-5 w-5 text-secondary" />;
    if (rank === 15) return <IconStar className="h-5 w-5 text-secondary" />;
    return <IconUser className="h-4 w-4 text-secondary" />;
  };


  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 65) return 'text-purple-600 dark:text-purple-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getFinalScoreBg = (score: number) => {
    if (score >= 95) return 'bg-gradient-to-r from-emerald-500 to-green-500';
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-teal-500';
    if (score >= 75) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (score >= 65) return 'bg-gradient-to-r from-purple-500 to-violet-500';
    return 'bg-gradient-to-r from-orange-500 to-red-500';
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1); // round to 2 decimal places
  }

  return (
    <div className="rounded-lg border bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-fuchsia-50/50 p-6 dark:from-rose-950/20 dark:via-pink-950/15 dark:to-fuchsia-950/20">
      <div className="mb-6 flex items-center space-x-3">
        <div className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 p-2.5">
          <IconCrown className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent dark:from-rose-400 dark:to-pink-400">
            Top Candidates
          </h3>
          <p className="text-sm text-muted-foreground">
            Combined AI + HR rankings
          </p>
        </div>
      </div>

      {!rankings || rankings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <IconTrophy className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No rankings available yet.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Rankings will appear after HR evaluation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.slice(0, 5).map((a) => (
            <div
              key={a.applicantId}
              className="h-28 items-center place-content-center group relative overflow-hidden rounded-xl border bg-gradient-to-r from-white/90 to-gray-50/90 p-4 transition-all hover:shadow-xl hover:shadow-pink-100/50 dark:from-gray-900/90 dark:to-gray-800/90 dark:hover:shadow-pink-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-50/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-pink-900/10"></div>

              <div className="relative flex items-center space-x-4">
                <div className="w-auto flex items-center space-x-3">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg`}>
                    <div className="absolute z-10 opacity-40">{getRankIcon(a.rank)}</div>
                    <div className="z-20 text-sm font-bold text-white">{a.rank}</div>
                  </div>
                </div>

                <div className="w-1/2 flex items-center space-x-4">
                  {a.avatarUrl ? (
                    <div className="relative">
                      <img
                        src={a.avatarUrl}
                        alt={a.fullName}
                        className="h-12 w-12 rounded-full object-cover ring-3 ring-pink-200/60 transition-all group-hover:scale-105 group-hover:ring-pink-300/80 dark:ring-pink-800/60 dark:group-hover:ring-pink-700/80"
                      />
                      {a.rank <= 3 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 animate-pulse rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"></div>
                      )}
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-200 to-rose-200 ring-3 ring-pink-200/60 transition-all group-hover:scale-105 group-hover:ring-pink-300/80 dark:from-pink-800 dark:to-rose-800 dark:ring-pink-800/60 dark:group-hover:ring-pink-700/80" />
                  )}

                  <div className="flex-1 space-y-1">
                    <p className=" font-bold text-gray-900 dark:text-gray-100">
                      {a.fullName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {a.status && (
                          <Badge variant="outline" className="h-5 text-[10px]">
                            {formatBadgeText(a.status)}
                          </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-1/2 flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center space-x-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-1">
                              <IconBrain className="h-4 w-4 text-purple-500" />
                              <span
                                className={`text-sm font-bold ${getScoreColor(a.aiScore || 0)}`}
                              >
                              {a?.aiScore ? formatScore(a.aiScore) : '–'}
                            </span>
                            </div>
                            <span className="text-[9px] text-muted-foreground">
                            AI
                          </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>AI Score: {a.aiScore}%</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-1">
                              <IconUser className="h-4 w-4 text-blue-500" />
                              <span
                                className={`text-sm font-bold ${getScoreColor(a.hrScore || 0)}`}
                              >
                              {typeof a.hrScore === 'number' ? a.hrScore : '–'}
                            </span>
                            </div>
                            <span className="text-[9px] text-muted-foreground">
                            HR
                          </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>HR Score: {a.hrScore}%</TooltipContent>
                      </Tooltip>
                    </div>
                    {/* Final Score */}
                    {/*<Tooltip>*/}
                    {/*  <TooltipTrigger asChild>*/}
                    {/*    <div*/}
                    {/*      className={`flex h-8 w-8 items-center justify-center rounded-full ${getFinalScoreBg(a.finalScore || 0)} shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl`}*/}
                    {/*    >*/}
                    {/*    <span className="text-xs font-semibold text-white">*/}
                    {/*      {a?.finalScore ? formatScore(a.finalScore) : '–'}*/}
                    {/*    </span>*/}
                    {/*    </div>*/}
                    {/*  </TooltipTrigger>*/}
                    {/*  <TooltipContent>*/}
                    {/*    Final Score:  {a?.finalScore ? formatScore(a.finalScore) : '–'} (AI + HR combined)*/}
                    {/*  </TooltipContent>*/}
                    {/*</Tooltip>*/}
                  </div>
                  <div className="flex space-x-2">
                    {a.profileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs transition-all hover:bg-pink-100 dark:hover:bg-pink-900/30"
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
                          className="h-8 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg transition-all hover:from-rose-600 hover:to-pink-600 hover:shadow-xl"
                          onClick={() =>
                            console.log('Invite top candidate', a.id)
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
