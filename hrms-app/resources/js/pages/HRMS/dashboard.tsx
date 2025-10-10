import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { DashboardSectionCards } from '@/components/HRMS/dashboard/dashboard-section-cards';
import { ApplicantDataInteractive } from '@/components/HRMS/dashboard/applicant-data-interactive';
import { DataTable } from "@/components/HRMS/dashboard/interview-table";
import data from "@/components/HRMS/dashboard/data.json";

import AppLayout from '@/layouts/app-layout';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <DashboardSectionCards />
                        <div className="px-4 lg:px-6">
                            <ApplicantDataInteractive />
                        </div>
                        <DataTable data={data} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
