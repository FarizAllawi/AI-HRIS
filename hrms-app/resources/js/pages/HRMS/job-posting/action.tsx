import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import JobPostingForm from '@/components/HRMS/job-posting/JobPostingForm';

export default function JobPostingDetail() {

  const currentPath = window.location.pathname;
  const isCreate = currentPath.endsWith('/create');
  const isEdit = /\/HRMS\/job-posting\/\d+\/edit$/.test(currentPath);
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Job Posting', href: '/HRMS/job-posting' },
    { title:  isCreate ? "Create" : "Edit", href: '#' },
  ];


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Job Posting | ${isCreate ? 'Create' : 'Edit'}`} />
      <HRMSContentLayout
        title="Job Posting"
        description={`${isCreate ? 'Create a new ' : 'Update '}job posting to attract top talent.`}
      >
        <JobPostingForm />
      </HRMSContentLayout>
    </AppLayout>
  );
}


