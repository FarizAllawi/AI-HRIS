import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ApplicantRecord } from '@/components/HRMS/applicant/types';
import AppliedJobFilter from '@/components/HRMS/applicant/AppliedJobFilter';

type Props = {
    applicant: ApplicantRecord;
}

export default function ApplicantDetail({ applicant }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Applicant', href: '/HRMS/applicant' },
        { title: applicant.fullName, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Applicant — ${applicant.fullName}`} />
            <HRMSContentLayout
                title={applicant.fullName}
                description={`${applicant.positionTitle}${applicant.positionCode ? ` • ${applicant.positionCode}` : ''}`}
            >
              <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <div className="font-medium">Application</div>
                        <div className="text-sm text-muted-foreground">Date: {new Date(applicant.applicationDate).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">Status: {applicant.applicationStatus ?? 'new'}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="font-medium">Interview</div>
                        <div className="text-sm text-muted-foreground">Status: {applicant.interviewStatus}</div>
                        <div className="text-sm text-muted-foreground">When: {applicant.interviewDateTime ? new Date(applicant.interviewDateTime).toLocaleString() : '–'}</div>
                        <div className="text-sm text-muted-foreground">Type: {applicant.interviewType ?? 'tbd'}</div>
                        <div className="text-sm text-muted-foreground">Interviewer(s): {applicant.interviewers?.join(', ') || '–'}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="font-medium">Contact</div>
                        <div className="text-sm text-muted-foreground">Email: {applicant.contactEmail ?? '–'}</div>
                        <div className="text-sm text-muted-foreground">Phone: {applicant.contactPhone ?? '–'}</div>
                        <div className="text-sm text-muted-foreground">Profile: {applicant.profileUrl ? <a className="hover:underline" href={applicant.profileUrl} target="_blank" rel="noreferrer">Open</a> : '–'}</div>
                        <div className="text-sm text-muted-foreground">Resume: {applicant.resumeUrl ? <a className="hover:underline" href={applicant.resumeUrl} target="_blank" rel="noreferrer">Open</a> : '–'}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="font-medium">Meta</div>
                        <div className="text-sm text-muted-foreground">Feedback: {applicant.feedbackStatus ?? 'n/a'}</div>
                        <div className="text-sm text-muted-foreground">Resume Score: {applicant.resumeScore ?? '–'}</div>
                        <div className="text-sm text-muted-foreground">Referral: {applicant.referralSource ?? '–'}</div>
                    </div>
                </div>
                <AppliedJobFilter />
            </HRMSContentLayout>
        </AppLayout>
    );
}


