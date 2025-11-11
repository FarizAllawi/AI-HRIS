import { useJobPostingToasts } from '@/hooks/use-job-posting-toasts';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import {
  JobPostingForm,
} from '@/components/HRMS/job-posting/action/JobPostingForm';
import { JobPostingFormValues } from '@/components/HRMS/job-posting/action/schema';
import AppLayout from '@/layouts/app-layout';
import { Briefcase } from 'lucide-react';

export default function JobPostingDetail({
  jobPosting,
}: {
  jobPosting?: Partial<JobPostingFormValues> & { id?: string };
}) {
  const currentPath = window.location.pathname;
  const isCreate = currentPath.endsWith('/create');
  const { showInfo, showSuccess, showError } = useJobPostingToasts();
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Job Posting', href: '/HRMS/job-posting' },
    { title: isCreate ? 'Create' : 'Update', href: '#' },
  ];

  const handleSubmit = (data: JobPostingFormValues) => {
    // Show loading toast
    const loadingMessage =
      data.status === 'published'
        ? `Publishing "${data.title}"...`
        : `Saving "${data.title}"...`;
    showInfo('Processing', loadingMessage);

    if (isCreate) {
      router.post('/HRMS/job-posting', data, {
        onSuccess: () => {
          // Show success toast before redirect
          const successMessage =
            data.status === 'published'
              ? `Job posting "${data.title}" published successfully!`
              : `Job posting "${data.title}" saved as draft.`;
          showSuccess('Success', successMessage);

          // Delay redirect to show toast
          setTimeout(() => {
            router.visit('/HRMS/job-posting');
          }, 1500);
        },
        onError: (errors) => {
          console.log('Validation errors:', errors);
          const errorCount = Object.keys(errors).length;
          const errorMessage =
            errorCount > 1
              ? `Please fix ${errorCount} validation errors below`
              : 'Please check the form for validation errors';
          showError('Validation Error', errorMessage);
        },
      });
    } else {
      router.post(
        `/HRMS/job-posting/${jobPosting?.id}`,
        {
          ...data,
          _method: 'PUT',
        },
        {
          onSuccess: () => {
            // Show success toast before redirect
            const successMessage =
              data.status === 'published'
                ? `Job posting "${data.title}" published successfully!`
                : `Job posting "${data.title}" updated successfully.`;
            showSuccess('Success', successMessage);

            // Delay redirect to show toast
            setTimeout(() => {
              router.visit('/HRMS/job-posting');
            }, 1500);
          },
          onError: (errors) => {
            console.log('Validation errors:', errors);
            const errorCount = Object.keys(errors).length;
            const errorMessage =
              errorCount > 1
                ? `Please fix ${errorCount} validation errors below`
                : 'Please check the form for validation errors';
            showError('Validation Error', errorMessage);
          },
        },
      );
    }
  };

  console.log("jobPostingDetail:", jobPosting);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Job Posting | ${isCreate ? 'Create' : 'Edit'}`} />
      <HRMSContentLayout
        iconTitle={<Briefcase className="w-6 h-6 text-white"/> }
        title="Job Posting"
        description={`${isCreate ? 'Create a new ' : 'Update '}job posting to attract top talent.`}
      >
        <JobPostingForm initialValues={jobPosting} onSubmit={handleSubmit} />
      </HRMSContentLayout>
    </AppLayout>
  );
}
