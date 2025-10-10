import React from 'react';
import AppliedJobWithAnswers, { AppliedJobWithAnswersProps } from './AppliedJobWithAnswers';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

export default function AppliedJobFilter({
	appliedJobsWithAnswers = dummyAppliedJobsWithAnswers,
}: {
	appliedJobsWithAnswers?: AppliedJobWithAnswersProps[];
}) {
	return (
		<div className="mb-6 bg-white rounded-xl shadow-sm p-6 border">
			<Tabs defaultValue={appliedJobsWithAnswers[0]?.job.code || ''} className="w-full">
				<TabsList className="mb-6 flex flex-wrap gap-2 bg-muted rounded-lg p-2 place-content-center items-center">
					{appliedJobsWithAnswers.map((item) => (
						<TabsTrigger
							key={item.job.code}
							value={item.job.code}
							className="px-6 py-3 rounded-lg text-base data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-muted-foreground border"
						>
							<span className="text-base">{item.job.title}</span>
							<span className="ml-1 text-base">({item.job.code})</span>
						</TabsTrigger>
					))}
				</TabsList>
				{appliedJobsWithAnswers.map((item) => (
					<TabsContent key={item.job.code} value={item.job.code}>
						<AppliedJobWithAnswers job={item.job} answers={item.answers} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
