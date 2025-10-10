import React from 'react';
import { IconBrain, IconLoader2, IconUsers } from '@tabler/icons-react';

export type AiProgress = {
  aiScreenedCount: number;
  aiScreeningCurrent: number;
  totalApplicants: number;
};

type Props = {
  aiProgress?: AiProgress;
};

export default function AiScreeningProgress({ aiProgress }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 font-medium">AI Screening Progress</div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border p-4">
          <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconBrain className="size-4" />
          </div>
          <div className="text-muted-foreground text-xs">AI Screened</div>
          <div className="text-3xl font-bold">{aiProgress?.aiScreenedCount ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <IconLoader2 className="size-4 animate-spin" />
          </div>
          <div className="text-muted-foreground text-xs">Screening Now</div>
          <div className="text-3xl font-bold">{aiProgress?.aiScreeningCurrent ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
            <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground text-xs">Total Applicants</div>
          <div className="text-3xl font-bold">{aiProgress?.totalApplicants ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
