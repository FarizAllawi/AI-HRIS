import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import HrisContentLayout from '@/components/HRIS/hris-content-Layout';
import JobPostingForm from '@/components/HRIS/job-posting/JobPostingForm';

export default function JobPostingDetail() {

  const currentPath = window.location.pathname;
  const isCreate = currentPath.endsWith('/create');
  const isEdit = /\/HRIS\/job-posting\/\d+\/edit$/.test(currentPath);
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Job Posting', href: '/HRIS/job-posting' },
    { title:  isCreate ? "Create" : "Edit", href: '#' },
  ];


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Job Posting | ${isCreate ? 'Create' : 'Edit'}`} />
      <HrisContentLayout
        title="Job Posting"
        description={`${isCreate ? 'Create a new ' : 'Update '}job posting to attract top talent.`}
      >
        <JobPostingForm />
      </HrisContentLayout>
    </AppLayout>
  );
}


