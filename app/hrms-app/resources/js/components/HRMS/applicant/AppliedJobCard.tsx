// AppliedJobCard.tsx - Enhanced version
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarcodeIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  MapPinIcon,
  StarIcon,
  SparklesIcon,
} from 'lucide-react';

export type AppliedJobInfo = {
  title: string;
  department: string;
  dateApplied: string;
  location: string;
  code: string;
  score?: number; // Added score for enhancement
};

export default function AppliedJobCard({ job }: { job: AppliedJobInfo }) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <Card className="mb-6 border-2 border-blue-200/50 bg-gradient-to-br from-white/80 to-blue-50/50 shadow-2xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden group backdrop-blur-sm dark:border-blue-800/30 dark:from-gray-800/80 dark:to-blue-950/20">
      {/* Enhanced Accent border with gradient */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-600 shadow-lg"></div>

      <CardHeader className="flex flex-row items-center justify-between pb-4 pl-8 pr-6 pt-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <BriefcaseIcon size={24} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <SparklesIcon size={16} className="text-yellow-400 fill-yellow-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {job.title}
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{job.department}</span>
              {job.score && (
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${getScoreBgColor(job.score)} border-2 border-white/50 shadow-lg`}>
                  <StarIcon size={14} className={getScoreColor(job.score)} fill="currentColor" />
                  <span className={`text-sm font-bold ${getScoreColor(job.score)}`}>
                    {job.score}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-white/50 dark:border-gray-800/50">
          #{job.code}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm pl-8 pr-6 pb-6">
        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border-2 border-blue-200/50 shadow-lg backdrop-blur-sm dark:bg-gray-800/60 dark:border-blue-800/30 transition-all duration-300 hover:scale-105">
          <div className="p-2 bg-blue-100 rounded-xl dark:bg-blue-900/30">
            <BuildingIcon size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Department</div>
            <div className="font-bold text-gray-900 dark:text-white">{job.department}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border-2 border-green-200/50 shadow-lg backdrop-blur-sm dark:bg-gray-800/60 dark:border-green-800/30 transition-all duration-300 hover:scale-105">
          <div className="p-2 bg-green-100 rounded-xl dark:bg-green-900/30">
            <MapPinIcon size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Location</div>
            <div className="font-bold text-gray-900 dark:text-white">{job.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border-2 border-purple-200/50 shadow-lg backdrop-blur-sm dark:bg-gray-800/60 dark:border-purple-800/30 transition-all duration-300 hover:scale-105">
          <div className="p-2 bg-purple-100 rounded-xl dark:bg-purple-900/30">
            <BarcodeIcon size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Job Code</div>
            <div className="font-bold text-gray-900 dark:text-white">{job.code}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border-2 border-orange-200/50 shadow-lg backdrop-blur-sm dark:bg-gray-800/60 dark:border-orange-800/30 transition-all duration-300 hover:scale-105">
          <div className="p-2 bg-orange-100 rounded-xl dark:bg-orange-900/30">
            <CalendarIcon size={18} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Applied</div>
            <div className="font-bold text-gray-900 dark:text-white">
              {new Date(job.dateApplied).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
