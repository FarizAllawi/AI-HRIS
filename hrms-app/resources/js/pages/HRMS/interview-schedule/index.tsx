import { Head } from '@inertiajs/react';
import { index as interviewSchedule } from '@/routes/interview-schedule';
import { type BreadcrumbItem } from '@/types';


import AppLayout from '@/layouts/app-layout';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import InterviewScheduleDataTable, { type InterviewScheduleItem } from '@/components/HRMS/interview-schedule/interview-schedule-data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Interview Schedule',
        href: interviewSchedule().url,
    },
];

export default function InterviewSchedule() {

    const handleCreateNew = () => {
        console.log('handle create new');
    }

    const items: InterviewScheduleItem[] = [
        {
            id: 1,
            candidateName: 'John Doe',
            candidateProfileUrl: '/candidates/1',
            positionTitle: 'Software Engineer',
            positionCode: 'SE-001',
            interviewDateTime: new Date(Date.now() + 86400000).toISOString(),
            status: 'scheduled',
            interviewType: 'video',
            interviewers: [
                { id: 'u1', name: 'Jane Smith' },
                { id: 'u2', name: 'Mark Lee' },
            ],
            feedbackStatus: 'pending',
            notes: 'Strong portfolio',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 2,
            candidateName: 'Maria Lin',
            positionTitle: 'UI Designer',
            positionCode: 'UI-207',
            interviewDateTime: new Date().toISOString(),
            status: 'today',
            interviewType: 'in_person',
            interviewers: [
                { id: 'u3', name: 'Mark Lee' },
            ],
            feedbackStatus: 'submitted',
            locationOrLink: 'Meeting Room A',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 3,
            candidateName: 'Omar Rahman',
            positionTitle: 'HR Associate',
            positionCode: 'HR-015',
            interviewDateTime: null,
            status: 'candidate_proposed',
            interviewType: 'tbd',
            interviewers: [],
            candidateResponse: 'proposed',
            feedbackStatus: 'none',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 4,
            candidateName: 'Aisha Khan',
            positionTitle: 'Project Manager',
            positionCode: 'PM-332',
            interviewDateTime: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: 'completed',
            interviewType: 'phone',
            interviewers: [
                { id: 'u4', name: 'Tom Alvarez' },
            ],
            feedbackStatus: 'submitted',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 5,
            candidateName: 'Luis Garcia',
            positionTitle: 'QA Engineer',
            positionCode: 'QA-120',
            interviewDateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
            status: 'invited',
            interviewType: 'video',
            interviewers: [
                { id: 'u5', name: 'Nina Patel' },
            ],
            feedbackStatus: 'none',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 6,
            candidateName: 'Chen Wei',
            positionTitle: 'Data Analyst',
            positionCode: 'DA-210',
            interviewDateTime: new Date(Date.now() + 3 * 86400000).toISOString(),
            status: 'reschedule_requested',
            interviewType: 'video',
            interviewers: [
                { id: 'u6', name: 'Sara Johnson' },
            ],
            feedbackStatus: 'pending',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 7,
            candidateName: 'Peter Novak',
            positionTitle: 'DevOps Engineer',
            positionCode: 'DE-404',
            interviewDateTime: new Date(Date.now() - 86400000).toISOString(),
            status: 'no_show',
            interviewType: 'video',
            interviewers: [
                { id: 'u7', name: 'Helen Park' },
            ],
            feedbackStatus: 'none',
            updatedAt: new Date().toISOString(),
        },
        {
            id: 8,
            candidateName: 'Rina Sato',
            positionTitle: 'Product Designer',
            positionCode: 'PD-118',
            interviewDateTime: new Date(Date.now() + 5 * 86400000).toISOString(),
            status: 'cancelled',
            interviewType: 'in_person',
            interviewers: [
                { id: 'u8', name: 'Akira Tanaka' },
            ],
            feedbackStatus: 'none',
            updatedAt: new Date().toISOString(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Interview Schedule" />
            <HRMSContentLayout
                title='Interview Schedule'
                description='Manage and track all Interview Schedule in your organization.'
                createTitle='Create New Interview Schedule'
                onCreateNew={handleCreateNew}
            >
                <InterviewScheduleDataTable
                    items={items}
                    onView={() => {}}
                    onReschedule={() => {}}
                    onCancel={() => {}}
                    onJoin={() => {}}
                    onAddFeedback={() => {}}
                    onReviewProposal={() => {}}
                    onApproveProposal={() => {}}
                    onSuggestAnotherTime={() => {}}
                    onResendInvitation={() => {}}
                    onEditInvitation={() => {}}
                    onMarkCompleted={() => {}}
                    onReinitiate={() => {}}
                />
            </HRMSContentLayout>
        </AppLayout>
    );
}
