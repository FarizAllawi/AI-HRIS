import { ApplicantTable } from '@/components/HRMS/applicant/applicant-table';
import type { ApplicantRecord } from '@/components/HRMS/applicant/types';
import HRMSContentLayout from '@/components/HRMS/hrms-content-Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { applicantMock } from '@/data/applicants';
import AppLayout from '@/layouts/app-layout';
import { index as applicant } from '@/routes/applicant';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Applicant',
    href: applicant().url,
  },
];

export default function Applicant() {
  const handleView = (a: ApplicantRecord) => console.log('View applicant', a);
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Applicants This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{12}</div>
              <div className="text-sm text-muted-foreground">
                +32% vs last month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Applicants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{37}</div>
              <div className="text-sm text-muted-foreground">All time</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg. Resume Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{85}</div>
              <div className="text-sm text-muted-foreground">This month</div>
            </CardContent>
          </Card>
        </div>

        <ApplicantTable
          items={applicantMock}
          onView={handleView}
          onInvite={handleInvite}
          onSchedule={handleSchedule}
        />
      </HRMSContentLayout>
    </AppLayout>
  );
}
