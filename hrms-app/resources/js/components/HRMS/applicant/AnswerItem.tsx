// AnswerItem.tsx - Enhanced version with Dark Mode
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HelpCircle, Star, Target, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CompetenciesScores = {
  total_competencies_scores: number;
  competency_1_score: number;
  competency_2_score: number;
};

type CombinedQuestionCompetenciesScores = {
  total_combined_scores: number;
  combined_question_competencies_1_score: number;
  combined_question_competencies_2_score: number;
};

type AIMetaScore = {
  question_id: string;
  question_score: number;
  competencies_scores: CompetenciesScores;
  combined_question_competencies_scores: CombinedQuestionCompetenciesScores;
  total_question_score: number;
};

export type AnswerItemProps = {
  question: string;
  answer: string;
  ai_score: number;
  hr_score: number;
  ai_meta_score: AIMetaScore;
};

function ScoreProgress({ value, label, description, icon: Icon }: { value: number; label: string; description: string; icon?: React.ComponentType<any> }) {
  const percentage = value * 100;
  const getColorClass = (val: number) => {
    if (val > 0.7) return 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600';
    if (val > 0.4) return 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600';
    return 'bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600';
  };

  return (
    <div className="space-y-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-3 w-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100">
              <p className="text-sm">{description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className={`text-sm font-bold ${
          percentage > 70 ? 'text-green-600 dark:text-green-400' :
            percentage > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
        indicatorClassName={getColorClass(value)}
      />
    </div>
  );
}

function ScoreCard({
                     title,
                     value,
                     className,
                     description,
                     icon: Icon
                   }: {
  title: string;
  value: number;
  className?: string;
  description: string;
  icon?: React.ComponentType<any>;
}) {
  const percentage = (value * 100).toFixed(1);
  const getColorClass = (val: number) => {
    if (val > 0.7) return 'from-green-500 to-emerald-500 border-green-200 dark:from-green-600 dark:to-emerald-600 dark:border-green-800';
    if (val > 0.4) return 'from-amber-500 to-orange-500 border-amber-200 dark:from-amber-600 dark:to-orange-600 dark:border-amber-800';
    return 'from-red-500 to-rose-500 border-red-200 dark:from-red-600 dark:to-rose-600 dark:border-red-800';
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm transition-transform hover:scale-105 ${getColorClass(value)} ${className}`}>
      {Icon && <Icon className="h-6 w-6 text-white mb-2 mx-auto" />}
      <div className="text-white text-sm font-semibold mb-1">{title}</div>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div className="text-2xl font-bold text-white drop-shadow-sm">{percentage}%</div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 max-w-[250px]">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function getScoreInterpretation(score: number): { label: string; description: string; color: string; bgColor: string; darkColor: string; darkBgColor: string } {
  const percentage = score * 100;

  if (percentage >= 80) {
    return {
      label: "Excellent Match",
      description: "Strong alignment with job requirements and excellent answer quality",
      color: "text-green-700",
      bgColor: "bg-gradient-to-r from-green-100 to-emerald-100 border-green-200",
      darkColor: "text-green-400",
      darkBgColor: "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-800"
    };
  } else if (percentage >= 60) {
    return {
      label: "Good Match",
      description: "Good alignment with most job requirements and solid answer quality",
      color: "text-green-600",
      bgColor: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      darkColor: "text-green-400",
      darkBgColor: "bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700"
    };
  } else if (percentage >= 40) {
    return {
      label: "Moderate Match",
      description: "Moderate alignment with some job requirements, needs review",
      color: "text-amber-700",
      bgColor: "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200",
      darkColor: "text-amber-400",
      darkBgColor: "bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700"
    };
  } else if (percentage >= 20) {
    return {
      label: "Weak Match",
      description: "Limited alignment with job requirements, likely not suitable",
      color: "text-orange-700",
      bgColor: "bg-gradient-to-r from-orange-100 to-red-100 border-orange-200",
      darkColor: "text-orange-400",
      darkBgColor: "bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-700"
    };
  } else {
    return {
      label: "Poor Match",
      description: "Very limited alignment with job requirements",
      color: "text-red-700",
      bgColor: "bg-gradient-to-r from-red-100 to-rose-100 border-red-200",
      darkColor: "text-red-400",
      darkBgColor: "bg-gradient-to-r from-red-900/20 to-rose-900/20 border-red-700"
    };
  }
}

export default function AnswerItem({
                                     question,
                                     answer,
                                     ai_score,
                                     hr_score,
                                     ai_meta_score,
                                   }: AnswerItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayScore = parseFloat((ai_score * 100).toFixed(1));
  const hrDisplayScore = parseFloat((hr_score * 100).toFixed(1));

  const aiInterpretation = getScoreInterpretation(ai_score);

  return (
    <TooltipProvider>
      <Card className="mb-6 border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"></div>
        <CardContent className="p-6 relative">
          {/* Question Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Question</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{question}</p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Candidate's Answer</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* AI Score */}
            <div className={`p-4 rounded-xl border-2 ${aiInterpretation.bgColor} dark:${aiInterpretation.darkBgColor} transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-gray-900 dark:text-white">AI Assessment</span>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 max-w-[300px]">
                    <p className="text-sm font-medium mb-1">Overall AI Assessment</p>
                    <p className="text-xs">
                      Measures how well the candidate's answer matches the job requirements
                      based on question relevance, required competencies, and overall alignment.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${aiInterpretation.color} dark:${aiInterpretation.darkColor}`}>
                  {displayScore}%
                </div>
                <Badge className={`${aiInterpretation.bgColor} ${aiInterpretation.color} dark:${aiInterpretation.darkBgColor} dark:${aiInterpretation.darkColor} border-current font-semibold`}>
                  {aiInterpretation.label}
                </Badge>
              </div>
            </div>

            {/* HR Score */}
            <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-700 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-gray-900 dark:text-white">HR Evaluation</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${
                  hrDisplayScore > 70 ? 'text-green-600 dark:text-green-400' :
                    hrDisplayScore > 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {hrDisplayScore}%
                </div>
                <Badge variant="outline" className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 font-semibold">
                  Human Reviewed
                </Badge>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto rounded-xl border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-700 dark:text-blue-400">Detailed AI Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Click to {isOpen ? 'collapse' : 'expand'}</span>
                  {isOpen ?
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform" /> :
                    <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400 transition-transform group-hover:translate-y-0.5" />
                  }
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-6 space-y-6 animate-accordion-down">
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreCard
                  title="Question Relevance"
                  value={ai_meta_score.question_score}
                  description="How directly the answer addresses the specific question asked. Measures relevance and completeness of response."
                  icon={Target}
                />
                <ScoreCard
                  title="Competencies Match"
                  value={ai_meta_score.competencies_scores.total_competencies_scores}
                  description="How well the answer demonstrates required job competencies and skills. Evaluates specific capability alignment."
                  icon={Zap}
                />
                <ScoreCard
                  title="Overall Alignment"
                  value={ai_meta_score.combined_question_competencies_scores.total_combined_scores}
                  description="Combined evaluation of question relevance and competency demonstration. Overall answer quality score."
                  icon={TrendingUp}
                />
              </div>

              {/* Detailed Progress Analysis */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Detailed Score Analysis
                </h4>

                <div className="space-y-4">
                  <ScoreProgress
                    value={ai_meta_score.question_score}
                    label="Question Relevance Score"
                    description="Measures how well the candidate's answer directly responds to and addresses the specific question asked. Higher scores indicate more complete and relevant responses."
                    icon={Target}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScoreProgress
                      value={ai_meta_score.competencies_scores.competency_1_score}
                      label="Technical Competency"
                      description="Evaluates demonstration of technical skills, knowledge, and expertise required for the role. Looks for specific technical capabilities mentioned in the answer."
                      icon={Zap}
                    />
                    <ScoreProgress
                      value={ai_meta_score.competencies_scores.competency_2_score}
                      label="Soft Skills Competency"
                      description="Assesses communication, teamwork, problem-solving, and other interpersonal skills. Measures how well the answer showcases behavioral competencies."
                      icon={TrendingUp}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ScoreProgress
                      value={ai_meta_score.combined_question_competencies_scores.combined_question_competencies_1_score}
                      label="Technical Alignment"
                      description="Combined score evaluating both question relevance and technical competency demonstration. Measures how well technical skills are communicated in context."
                      icon={Target}
                    />
                    <ScoreProgress
                      value={ai_meta_score.combined_question_competencies_scores.combined_question_competencies_2_score}
                      label="Behavioral Alignment"
                      description="Combined score evaluating question relevance and soft skills demonstration. Assesses how well interpersonal skills are showcased in the response."
                      icon={TrendingUp}
                    />
                  </div>
                </div>

                {/* Score Interpretation Guide */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Score Interpretation Guide
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="text-green-700 dark:text-green-400 font-semibold p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">80-100%: Excellent</div>
                    <div className="text-green-600 dark:text-green-400 font-semibold p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">60-79%: Good</div>
                    <div className="text-amber-600 dark:text-amber-400 font-semibold p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">40-59%: Moderate</div>
                    <div className="text-orange-600 dark:text-orange-400 font-semibold p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">20-39%: Weak</div>
                    <div className="text-red-600 dark:text-red-400 font-semibold p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">0-19%: Poor</div>
                  </div>
                </div>

                {/* Question ID */}
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-mono">Question ID: {ai_meta_score.question_id}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
