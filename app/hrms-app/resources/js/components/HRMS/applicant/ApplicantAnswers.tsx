// ApplicantAnswers.tsx - Enhanced version
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnswerItem, { AnswerItemProps } from './AnswerItem';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Star, TrendingUp, Target, Sparkles, Award } from 'lucide-react';

function getOverallScore(answers: AnswerItemProps[]): number {
  if (!answers || answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => sum + (a.ai_score * 100), 0);
  return parseFloat((total).toFixed(1));
}

function getScoreColor(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'text-green-600';
  if (percentage >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'bg-gradient-to-r from-green-500 to-emerald-500';
  if (percentage >= 40) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
  return 'bg-gradient-to-r from-red-500 to-orange-500';
}

function getScoreRingColor(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return 'ring-green-500/20';
  if (percentage >= 40) return 'ring-yellow-500/20';
  return 'ring-red-500/20';
}

export default function ApplicantAnswers({ answers }: { answers: AnswerItemProps[] }) {
  if (!answers || answers.length === 0) return null;

  const overallScore = getOverallScore(answers);
  const maxPossibleScore = answers.length * 100;
  const scorePercentage = (overallScore / maxPossibleScore) * 100;

  return (
    <TooltipProvider>
      <Card className="mb-6 pt-0 border-2 border-blue-200/50 shadow-2xl bg-gradient-to-br from-white/80 to-blue-50/50 overflow-hidden backdrop-blur-sm dark:border-blue-800/30 dark:from-gray-800/80 dark:to-blue-950/20">
        {/* Header with enhanced glowing effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10"></div>
          <CardHeader className="relative pb-6 pt-8 px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
              <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <span className="bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Screening Results
                </span>
              </CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-2 border-blue-300 font-bold text-sm px-4 py-2 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
                {answers.length} Question{answers.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Enhanced Score Display */}
            <div className="mt-6 p-6 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-blue-200/50 shadow-xl dark:bg-gray-800/60 dark:border-blue-800/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="relative">
                    <div className={`w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-2xl ring-4 ${getScoreRingColor(overallScore, maxPossibleScore)} dark:bg-gray-700 dark:border-gray-800`}>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(overallScore, maxPossibleScore)}`}>
                          {Math.round(scorePercentage)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Score</div>
                      </div>
                    </div>
                    <div className="absolute -top-3 -right-3">
                      <div className={`w-12 h-12 rounded-full ${getScoreBgColor(overallScore, maxPossibleScore)} flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800`}>
                        <Award className="h-5 w-5 text-white" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Overall Screening Score</h3>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-5 w-5 text-gray-400 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white max-w-[300px] p-4 border-0 shadow-2xl">
                          <p className="text-sm font-bold mb-2">Sum of All Question Scores</p>
                          <p className="text-xs">
                            Calculated by adding together the individual scores from all {answers.length} questions.
                            Maximum possible score: {maxPossibleScore}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className={`text-4xl font-bold ${getScoreColor(overallScore, maxPossibleScore)}`}>
                        {overallScore}
                        <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">/{maxPossibleScore}</span>
                      </div>
                      <Badge
                        className={`text-sm font-bold px-4 py-2 border-2 ${
                          scorePercentage >= 70 ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                            scorePercentage >= 40 ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700' :
                              'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                        }`}
                      >
                        {scorePercentage >= 70 ? 'Strong Candidate' :
                          scorePercentage >= 40 ? 'Moderate Fit' : 'Needs Review'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Enhanced Score Breakdown */}
                <div className="flex items-center justify-around lg:justify-center lg:flex-col lg:gap-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 border-2 border-blue-200/30 dark:border-blue-800/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {answers.filter(a => a.ai_score * 100 >= 70).length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Strong</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {answers.filter(a => a.ai_score * 100 >= 40 && a.ai_score * 100 < 70).length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Moderate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {answers.filter(a => a.ai_score * 100 < 40).length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Needs Review</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  <span>Overall Performance</span>
                  <span>{Math.round(scorePercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200/80 dark:bg-gray-700/80 rounded-full h-4 shadow-inner">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 shadow-lg ${getScoreBgColor(overallScore, maxPossibleScore)}`}
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardHeader>
        </div>

        <CardContent className="space-y-6 pt-2 pb-8 px-8">
          {answers.map((item, idx) => (
            <AnswerItem key={idx} {...item} />
          ))}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
