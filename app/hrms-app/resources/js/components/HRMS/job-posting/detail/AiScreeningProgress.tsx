import { Progress } from '@/components/ui/progress';
import {
  IconBrain,
  IconLoader2,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';

export type AiProgress = {
  aiScreenedCount: number;
  aiScreeningCurrent: number;
  totalApplicants: number;
};

type Props = {
  aiProgress?: AiProgress;
};

export default function AiScreeningProgress({ aiProgress }: Props) {
  const totalApplicants = aiProgress?.totalApplicants ?? 0;
  const aiScreenedCount = aiProgress?.aiScreenedCount ?? 0;
  const screeningProgress =
    totalApplicants > 0 ? (aiScreenedCount / totalApplicants) * 100 : 0;

  return (
    <div className="rounded-lg border bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-cyan-50/50 p-6 dark:from-purple-950/20 dark:via-blue-950/15 dark:to-cyan-950/20">
      <div className="mb-6 flex items-center space-x-3">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-2.5">
          <IconBrain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent dark:from-purple-400 dark:to-blue-400">
            AI Screening Progress
          </h3>
          <p className="text-sm text-muted-foreground">
            Intelligent candidate evaluation
          </p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center space-x-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900/30">
            <IconTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {Math.round(screeningProgress)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Screening Progress</span>
          <span className="text-muted-foreground">
            {aiScreenedCount} of {totalApplicants}
          </span>
        </div>
        <Progress
          value={screeningProgress}
          className="h-3 bg-gray-200 dark:bg-gray-800"
          style={{
            background: 'linear-gradient(to right, #e5e7eb, #e5e7eb)',
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 to-green-50 p-4 transition-all hover:shadow-lg dark:from-emerald-950/30 dark:to-green-950/30">
          <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-200/50 to-green-200/50 dark:from-emerald-800/30 dark:to-green-800/30"></div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg">
              <IconBrain className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              AI Screened
            </div>
            <div className="text-2xl font-bold text-emerald-900 transition-transform group-hover:scale-105 dark:text-emerald-100">
              {aiScreenedCount}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-all hover:shadow-lg dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-200/50 dark:from-amber-800/30 dark:to-orange-800/30"></div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
              <IconLoader2 className="h-6 w-6 animate-spin text-white" />
            </div>
            <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Screening Now
            </div>
            <div className="text-2xl font-bold text-amber-900 transition-transform group-hover:scale-105 dark:text-amber-100">
              {aiProgress?.aiScreeningCurrent ?? 0}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 transition-all hover:shadow-lg dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-gradient-to-br from-blue-200/50 to-indigo-200/50 dark:from-blue-800/30 dark:to-indigo-800/30"></div>
          <div className="relative">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
              <IconUsers className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Total Applicants
            </div>
            <div className="text-2xl font-bold text-blue-900 transition-transform group-hover:scale-105 dark:text-blue-100">
              {totalApplicants}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
