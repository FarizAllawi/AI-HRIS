import React from 'react';
import AppliedJobCard, { AppliedJobInfo } from './AppliedJobCard';
import ApplicantAnswers from './ApplicantAnswers';
import { AnswerItemProps } from './AnswerItem';
import { Card } from '@/components/ui/card';

export type AppliedJobWithAnswersProps = {
  job: AppliedJobInfo;
  answers: AnswerItemProps[];
};

export default function AppliedJobWithAnswers({ job, answers }: AppliedJobWithAnswersProps) {
  return (
    <div className="mb-6 p-0">
      <AppliedJobCard job={job} />
      <ApplicantAnswers answers={answers} />
    </div>
  );
}
