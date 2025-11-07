import AppliedJobWithAnswers, {
  AppliedJobWithAnswersProps,
} from './AppliedJobWithAnswers';
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  FileText,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AppliedJobFilter({
                                           appliedJobsWithAnswers,
                                         }: {
  appliedJobsWithAnswers: AppliedJobWithAnswersProps[];
}) {
  if (!appliedJobsWithAnswers || appliedJobsWithAnswers.length === 0) {
    return (
      // <div className="mb-6 rounded-3xl border-2 border-dashed border-gray-300/50 bg-gradient-to-br from-white to-blue-50/50 p-8 text-center dark:border-gray-700/50 dark:from-gray-900 dark:to-blue-950/20">
      <div>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="rounded-2xl bg-blue-100/50 p-4 dark:bg-blue-900/20">
            <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              You haven't applied to any positions yet. Start applying to see your screening results here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasMultipleJobs = appliedJobsWithAnswers.length > 1;

  // Calculate overall score for a job
  const getJobScore = (answers: any[]) => {
    if (!answers || answers.length === 0) return 0;
    const total = answers.reduce((sum, a) => sum + (a.ai_score * 100), 0);
    return parseFloat((total / answers.length).toFixed(1));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // For single job, render simplified view without tabs
  if (!hasMultipleJobs) {
    const job = appliedJobsWithAnswers[0];
    const score = getJobScore(job.answers);

    return (
        <div>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-200/50 px-6 py-4 mb-6 shadow-lg dark:bg-gray-800/80 dark:border-blue-800/30">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Applications & Screening Results
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                1 position applied
              </p>
            </div>
          </div>
        </div>

        {/* Single Job Header - Clean and Centered */}

        {/* Answers Content */}
        <AppliedJobWithAnswers job={job.job} answers={job.answers} />
      </div>
    );
  }

  // For multiple jobs, use the original tabs implementation
  // ... (keep your existing tabs implementation here for multiple jobs)
  return (
    <div>Multiple jobs implementation here...</div>
  );
}
