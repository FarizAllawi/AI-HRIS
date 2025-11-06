import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnswerItem, { AnswerItemProps } from './AnswerItem';

function getOverallScore(answers: AnswerItemProps[]): number {
  if (!answers || answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => sum + (a.ai_score * 100), 0);
  return parseFloat((total / answers.length).toFixed(1));
}

export default function ApplicantAnswers({ answers }: { answers: AnswerItemProps[] }) {
  if (!answers || answers.length === 0) return null;
  const overallScore = getOverallScore(answers);
  console.log("answers", answers);
  return (
    <Card className="mb-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Applicant Answers</CardTitle>
        <div className="mt-2 text-base font-semibold">
          Overall AI Screening Score:{' '}
          <span
            className={
              overallScore > 70
                ? 'text-green-600'
                : overallScore > 40
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }
          >
            {overallScore}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {answers.map((item, idx) => (
          <AnswerItem key={idx} {...item} />
        ))}
      </CardContent>
    </Card>
  );
}
