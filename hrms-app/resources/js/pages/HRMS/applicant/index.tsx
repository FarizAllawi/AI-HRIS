import { ApplicantTable } from '@/components/HRMS/applicant/applicant-table';
import type { ApplicantRecord } from '@/components/HRMS/applicant/types';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import AppLayout from '@/layouts/app-layout';
import { index as applicant } from '@/routes/applicant';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Applicant',
    href: applicant().url,
  },
];

export default function Applicant({
  applicants,
}: {
  applicants: ApplicantRecord[];
}) {
  const handleView = (a: ApplicantRecord) => router.visit(`/HRMS/applicant/${a.id}`);
  const handleInvite = (a: ApplicantRecord) =>
    console.log('Invite applicant', a);
  const handleSchedule = (a: ApplicantRecord) =>
    console.log('Schedule interview', a);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Applicant" />
      <HRMSContentLayout
        title="Applicant"
        description="Manage and track all Applicant data in your organization."
      >
        <ApplicantTable
          items={applicants || []}
          onView={handleView}
          onInvite={handleInvite}
          onSchedule={handleSchedule}
        />
      </HRMSContentLayout>
    </AppLayout>
  );
}
