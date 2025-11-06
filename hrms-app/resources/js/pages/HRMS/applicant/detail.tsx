import AppliedJobFilter from '@/components/HRMS/applicant/AppliedJobFilter';
import type { ApplicantRecord } from '@/components/HRMS/applicant/types';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Mail,
    Phone,
    FileText,
    User,
    Video,
    MessageSquare,
    Star,
    UserCheck,
    Clock,
    ExternalLink
} from 'lucide-react';

type Props = {
    applicant: ApplicantRecord;
};

export default function ApplicantDetail({ applicant }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Applicant', href: '/HRMS/applicant' },
        { title: applicant.fullName, href: '#' },
    ];

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const statusLower = status?.toLowerCase() || 'new';
        if (statusLower.includes('approved') || statusLower.includes('hired') || statusLower.includes('completed')) return 'default';
        if (statusLower.includes('pending') || statusLower.includes('scheduled') || statusLower.includes('review')) return 'secondary';
        if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return 'destructive';
        return 'outline';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Applicant — ${applicant.fullName}`} />
            <HRMSContentLayout
                title={applicant.fullName}
                description={`${applicant.positionTitle}${applicant.positionCode ? ` • ${applicant.positionCode}` : ''}`}
            >
                {/* Status Badge Row */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <Badge variant={getStatusVariant(applicant.applicationStatus || 'new')}>
                        Application: {applicant.applicationStatus || 'New'}
                    </Badge>
                    {applicant.interviewStatus && (
                        <Badge variant={getStatusVariant(applicant.interviewStatus)}>
                            Interview: {applicant.interviewStatus}
                        </Badge>
                    )}
                    {applicant.feedbackStatus && (
                        <Badge variant={getStatusVariant(applicant.feedbackStatus)}>
                            Feedback: {applicant.feedbackStatus}
                        </Badge>
                    )}
                    {applicant.resumeScore && (
                        <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3" />
                            Score: {applicant.resumeScore}
                        </Badge>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Application Details */}
                    <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Application Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Application Date</div>
                                    <div className="text-base text-gray-900">
                                        {new Date(applicant.applicationDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <UserCheck className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Status</div>
                                    <div className="mt-1">
                                        <Badge variant={getStatusVariant(applicant.applicationStatus || 'new')}>
                                            {applicant.applicationStatus || 'New Application'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            {applicant.referralSource && (
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-500">Referral Source</div>
                                        <div className="mt-1">
                                            <Badge variant="outline">{applicant.referralSource}</Badge>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interview Details */}
                    <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <Video className="h-5 w-5 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Interview Information</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <UserCheck className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Status</div>
                                    <div className="mt-1">
                                        <Badge variant={getStatusVariant(applicant.interviewStatus || 'not scheduled')}>
                                            {applicant.interviewStatus || 'Not Scheduled'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Scheduled Time</div>
                                    <div className="text-base text-gray-900">
                                        {applicant.interviewDateTime
                                            ? new Date(applicant.interviewDateTime).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'Not scheduled'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Video className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Interview Type</div>
                                    <div className="mt-1">
                                        <Badge variant="secondary">{applicant.interviewType || 'TBD'}</Badge>
                                    </div>
                                </div>
                            </div>
                            {applicant.interviewers && applicant.interviewers.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-500">Interviewers</div>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {applicant.interviewers.map((interviewer, idx) => (
                                                <Badge key={idx} variant="outline">
                                                    {interviewer}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-green-100 p-2">
                                <Mail className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Email Address</div>
                                    {applicant.contactEmail ? (
                                        <a
                                            href={`mailto:${applicant.contactEmail}`}
                                            className="text-base text-blue-600 hover:underline"
                                        >
                                            {applicant.contactEmail}
                                        </a>
                                    ) : (
                                        <Badge variant="outline" className="mt-1">Not provided</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Phone Number</div>
                                    {applicant.contactPhone ? (
                                        <a
                                            href={`tel:${applicant.contactPhone}`}
                                            className="text-base text-blue-600 hover:underline"
                                        >
                                            {applicant.contactPhone}
                                        </a>
                                    ) : (
                                        <Badge variant="outline" className="mt-1">Not provided</Badge>
                                    )}
                                </div>
                            </div>
                            {applicant.profileUrl && (
                                <div className="flex items-start gap-3">
                                    <User className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-500">Profile</div>
                                        <a
                                            className="mt-1 inline-flex items-center gap-1 text-base text-blue-600 hover:underline"
                                            href={applicant.profileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Badge variant="outline" className="gap-1">
                                                View Profile <ExternalLink className="h-3 w-3" />
                                            </Badge>
                                        </a>
                                    </div>
                                </div>
                            )}
                            {applicant.resumeUrl && (
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-500">Resume</div>
                                        <a
                                            className="mt-1 inline-flex items-center gap-1 text-base text-blue-600 hover:underline"
                                            href={applicant.resumeUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Badge variant="outline" className="gap-1">
                                                View Resume <ExternalLink className="h-3 w-3" />
                                            </Badge>
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="rounded-xl border bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-orange-100 p-2">
                                <MessageSquare className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Additional Information</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-500">Feedback Status</div>
                                    <div className="mt-1">
                                        <Badge variant={getStatusVariant(applicant.feedbackStatus || 'n/a')}>
                                            {applicant.feedbackStatus || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            {applicant.resumeScore && (
                                <div className="flex items-start gap-3">
                                    <Star className="mt-0.5 h-4 w-4 text-gray-400" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-500">Resume Score</div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge variant="outline" className="gap-1">
                                                <Star className="h-3 w-3" />
                                                {applicant.resumeScore}
                                            </Badge>
                                            <div className="h-2 flex-1 rounded-full bg-gray-200">
                                                <div
                                                    className="h-2 rounded-full bg-blue-600"
                                                    style={{ width: `${Math.min(Number(applicant.resumeScore) || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Applications & Answers Section */}
                {Array.isArray(applicant.appliedJobsWithAnswers) && applicant.appliedJobsWithAnswers.length > 0 && (
                    <div className="mt-8">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-indigo-100 p-2">
                                <FileText className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Applications & Answers</h3>
                        </div>
                        <AppliedJobFilter appliedJobsWithAnswers={applicant.appliedJobsWithAnswers} />
                    </div>
                )}
            </HRMSContentLayout>
        </AppLayout>
    );
}
