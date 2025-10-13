import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

import { index as jobPosting } from '@/routes/job-posting';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';

import { JobPostingTable } from '@/components/HRMS/job-posting';
import { dummyJobPostings } from '@/data/job-postings';
import { JobPosting } from '@/types/job-posting';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Job Posting',
        href: jobPosting().url,
    },
];

export default function JobPostingIndex() {
    const [jobPostings] = useState<JobPosting[]>(dummyJobPostings);

    const handleCreateNew = () => {
        router.visit('/HRMS/job-posting/create', { method: 'get'});
    };

    const handleView = (jobPosting: JobPosting) => {
        console.log('View job posting:', jobPosting.id);
        // TODO: Navigate to view job posting page
    };

    const handleEdit = (jobPosting: JobPosting) => {
        console.log('Edit job posting:', jobPosting.id);
        // TODO: Navigate to edit job posting page
    };

    const handleDelete = (jobPosting: JobPosting) => {
        console.log('Delete job posting:', jobPosting.id);
        // TODO: Implement delete functionality
    };

    const handleToggleStatus = (jobPosting: JobPosting) => {
        console.log('Toggle status for job posting:', jobPosting.id);
        // TODO: Implement toggle status functionality
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Posting" />
            <HRMSContentLayout
                title='Job Posting'
                description='Manage and track all job postings in your organization.'
                createTitle='Create New Job Posting'
                onCreateNew={handleCreateNew}
            >
                <JobPostingTable
                    jobPostings={jobPostings}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            </HRMSContentLayout>
        </AppLayout>
    );
}
