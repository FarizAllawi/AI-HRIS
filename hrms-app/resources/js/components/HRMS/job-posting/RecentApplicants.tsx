import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IconMailPlus } from '@tabler/icons-react';

type Applicant = {
  id: string;
  fullName: string;
  applicationDate: string;
  status: string;
  resumeScore?: number;
  profileUrl?: string;
  avatarUrl?: string;
};

type Props = {
  applicants?: Applicant[];
  filteredApplicants: Applicant[];
  query: string;
  setQuery: (q: string) => void;
  timeRange: 'all' | 'today' | '7d' | '30d';
  setTimeRange: (v: 'all' | 'today' | '7d' | '30d') => void;
};

export default function RecentApplicants({
  applicants,
  filteredApplicants,
  query,
  setQuery,
  timeRange,
  setTimeRange,
}: Props) {
  return (
    <div className="rounded-lg border p-4 md:col-span-2">
      <div className="mb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Recent Applicants</div>
          <div className="text-sm text-muted-foreground">
            {filteredApplicants.length} of {applicants?.length ?? 0} shown
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search applicant name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-[260px]"
          />
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as typeof timeRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {!filteredApplicants || filteredApplicants.length === 0 ? (
        <div className="text-sm text-muted-foreground">No applicants yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplicants.map((a) => (
            <div key={a.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {a.avatarUrl ? (
                    <img
                      src={a.avatarUrl}
                      alt={a.fullName}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-muted" />
                  )}
                  <div className="truncate font-medium">{a.fullName}</div>
                </div>
                {typeof a.resumeScore === 'number' ? (
                  <span className="text-xs text-muted-foreground">
                    Score: {a.resumeScore}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Applied {new Date(a.applicationDate).toLocaleDateString()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground capitalize">
                Status: {a.status.replace('_', ' ')}
              </div>
              <div className="mt-2 flex items-center justify-between">
                {a.profileUrl ? (
                  <a
                    href={a.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm hover:underline"
                  >
                    View Profile
                  </a>
                ) : (
                  <span className="text-sm">View Profile</span>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Invite to interview"
                      onClick={() => console.log('Invite to interview', a.id)}
                    >
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
