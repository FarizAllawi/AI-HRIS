import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AnswerItem, { AnswerItemProps } from './AnswerItem';

const dummyAnswers: AnswerItemProps[] = [
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
	{
		question: 'What motivates you in a remote work environment?',
		answer: 'Autonomy and the ability to focus without distractions.',
		score: 65,
	},
	{
		question: 'Are you comfortable with code reviews?',
		answer: 'Yes, I believe code reviews improve code quality and team learning.',
		score: 92,
	},
];

function getOverallScore(answers: AnswerItemProps[]): number {
	if (!answers.length) return 0;
	const total = answers.reduce((sum, a) => sum + a.score, 0);
	return Math.round(total / answers.length);
}

export default function ApplicantAnswers({
	answers = dummyAnswers,
}: {
	answers?: AnswerItemProps[];
}) {
	const overallScore = getOverallScore(answers);
	return (
		<Card className="mb-2">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium">
					Applicant Answers
				</CardTitle>
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
