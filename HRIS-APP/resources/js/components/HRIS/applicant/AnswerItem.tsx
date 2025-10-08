import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export type AnswerItemProps = {
  question: string;
  answer: string;
  score: number;
};

export default function AnswerItem({ question, answer, score }: AnswerItemProps) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="font-semibold text-xs mb-1">Q: {question}</div>
        <div className="text-xs mb-1">A: {answer}</div>
        <div className="text-xs text-muted-foreground">AI Screening Score: <span className={score > 70 ? 'text-green-600' : score > 40 ? 'text-yellow-600' : 'text-red-600'}>{score}</span></div>
      </CardContent>
    </Card>
  );
}
