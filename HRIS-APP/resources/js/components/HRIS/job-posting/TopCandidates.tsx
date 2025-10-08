import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IconMailPlus } from '@tabler/icons-react';

type Candidate = {
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
};

type Props = {
  rankings?: Candidate[];
};

export default function TopCandidates({ rankings }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 font-medium">Top Candidates</div>
      {(!rankings || rankings.length === 0) ? (
        <div className="text-muted-foreground text-sm">No rankings available.</div>
      ) : (
        <div className="space-y-2">
          {rankings.slice(0, 6).map((a) => (
            <div key={a.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-muted-foreground text-md w-5 text-right">#{a.rank}</span>
                  {a.avatarUrl ? (
                    <img src={a.avatarUrl} alt={a.fullName} className="size-10 rounded-full object-cover" />
                  ) : (
                    <div className="size-10 rounded-full bg-muted" />
                  )}
                  <span className="truncate text-md font-medium">{a.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-[10px]">AI</span>
                        <span className="text-foreground text-sm font-semibold">{typeof a.aiScore === 'number' ? a.aiScore : '–'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Artificial Intelligence Screening Score</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-[10px]">HR</span>
                        <span className="text-foreground text-sm font-semibold">{typeof a.hrScore === 'number' ? a.hrScore : '–'}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Human Resource Score</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        aria-label="Final score"
                        className="bg-black text-white flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold"
                      >
                        {typeof a.finalScore === 'number' ? a.finalScore : '–'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Final score (combined AI + HR)</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                {a.status ? (
                  <Badge variant="outline" className="text-xs capitalize">
                    {a.status.replace('_', ' ')}
                  </Badge>
                ) : <span />}
                {a.profileUrl ? (
                  <a href={a.profileUrl} target="_blank" rel="noreferrer" className="text-xs hover:underline">View Profile</a>
                ) : (
                  <span className="text-xs text-muted-foreground">Profile</span>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" aria-label="Invite to interview" onClick={() => console.log('Invite top candidate', a.id)}>
                      <IconMailPlus className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Invite to interview</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
