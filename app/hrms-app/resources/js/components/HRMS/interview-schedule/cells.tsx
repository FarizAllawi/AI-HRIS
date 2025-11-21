import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IconCheck, IconMessage } from '@tabler/icons-react';
import type { Interviewer } from './types';

export function InterviewersCell({
  interviewers,
}: {
  interviewers?: Interviewer[];
}) {
  if (!interviewers || interviewers.length === 0)
    return <span className="text-muted-foreground">–</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {interviewers.slice(0, 3).map((person) => (
          <Avatar key={person.id} className="size-6 ring-2 ring-background">
            <AvatarImage
              src={person.avatarUrl ?? undefined}
              alt={person.name}
            />
            <AvatarFallback>
              {person.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {interviewers[0]?.name}
        {interviewers.length > 1 ? ` +${interviewers.length - 1}` : ''}
      </div>
    </div>
  );
}

export function FeedbackCell({
  feedbackStatus,
}: {
  feedbackStatus?: 'submitted' | 'pending' | 'none';
}) {
  switch (feedbackStatus) {
    case 'submitted':
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-green-700">
              <IconCheck className="size-4" /> Submitted
            </span>
          </TooltipTrigger>
          <TooltipContent>Feedback submitted</TooltipContent>
        </Tooltip>
      );
    case 'pending':
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-yellow-700">
              <IconMessage className="size-4" /> Pending
            </span>
          </TooltipTrigger>
          <TooltipContent>Feedback pending</TooltipContent>
        </Tooltip>
      );
    default:
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-muted-foreground">–</span>
          </TooltipTrigger>
          <TooltipContent>No feedback</TooltipContent>
        </Tooltip>
      );
  }
}
