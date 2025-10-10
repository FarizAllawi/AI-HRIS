import React from 'react';
import AppliedJobWithAnswers, { AppliedJobWithAnswersProps } from './AppliedJobWithAnswers';

const dummyAppliedJobsWithAnswers: AppliedJobWithAnswersProps[] = [
  {
    job: {
      title: 'Frontend Developer',
      department: 'Engineering',
      dateApplied: '2025-10-01',
      location: 'Jakarta',
      code: 'FD-2025',
    },
    answers: [
      {
        question: 'Describe your experience with React.',
        answer: 'I have 3 years of experience building SPAs with React and TypeScript.',
        score: 85,
      },
      {
        question: 'How do you handle tight deadlines?',
        answer: 'I prioritize tasks and communicate proactively with my team.',
        score: 78,
      },
    ],
  },
  {
    job: {
      title: 'UI/UX Designer',
      department: 'Design',
      dateApplied: '2025-09-15',
      location: 'Bandung',
      code: 'UX-2025',
    },
    answers: [
      {
        question: 'Describe your design process.',
        answer: 'I start with user research, then wireframes, and iterate based on feedback.',
        score: 80,
      },
      {
        question: 'How do you collaborate with developers?',
        answer: 'I use Figma and regular standups to ensure smooth handoff.',
        score: 75,
      },
    ],
  },
];

export default function AppliedJobWithAnswersList({ appliedJobsWithAnswers = dummyAppliedJobsWithAnswers }: { appliedJobsWithAnswers?: AppliedJobWithAnswersProps[] }) {
  return (
    <div>
      {appliedJobsWithAnswers.map((item, idx) => (
        <AppliedJobWithAnswers key={idx} job={item.job} answers={item.answers} />
      ))}
    </div>
  );
}
