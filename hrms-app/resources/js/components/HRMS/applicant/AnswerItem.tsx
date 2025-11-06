import { Card, CardContent } from '@/components/ui/card';

type CompetenciesScore = {
  total_competencies_scores: number;
}

type CombinedScore = {
  total_combined_scores: number;
}

type AIMetaScore = {
  question_id: string;
  question: number;
  competencies: CompetenciesScore;
  combined_question_competencies_scores: CombinedScore;
  total_question_score: number;
}

export type AnswerItemProps = {
  question: string;
  answer: string;
  ai_score: number;
  ai_meta_score: AIMetaScore[];
};

export default function AnswerItem({
  question,
  answer,
  ai_score,
  ai_meta_score,
}: AnswerItemProps) {
  ai_score = parseFloat((ai_score * 100).toFixed(1))
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="mb-1 text-sm font-semibold">Q: {question}</div>
        <div className="mb-1 text-sm">A: {answer}</div>
        <div className="text-sm text-muted-foreground">
          AI Screening Score:{' '}
          <span
            className={
              ai_score > 70
                ? 'text-green-600'
                : ai_score > 40
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }
          >
            {ai_score}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
