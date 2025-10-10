import { Head } from '@inertiajs/react';
import { index as employee } from '@/routes/employee';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import HRMSContentLayout from '@/components/HRMS/HRMS-content-Layout';
import { EmployeeTable } from '@/components/HRMS/employee/employee-table';
import type { EmployeeRecord } from '@/components/HRMS/employee/types';
import { employeesMock } from '@/data/employees';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Employee',
        href: employee().url,
    },
];

export default function Employee() {

    const handleCreateNew = () => {
        console.log("Handle Create New")
    }
    const handleView = (emp: EmployeeRecord) => console.log('View', emp);
    const handleEdit = (emp: EmployeeRecord) => console.log('Edit', emp);
    const handleTerminate = (emp: EmployeeRecord) => console.log('Terminate', emp);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee" />
            <HRMSContentLayout
                title='Employee'
                description='Manage and track all Empolyee data in your organization.'
                createTitle='Create New Employee'
                onCreateNew={handleCreateNew}
            >
                <EmployeeTable
                    items={employeesMock}
                    onView={handleView}
                    onEdit={handleEdit}
                    onTerminate={handleTerminate}
                />
            </HRMSContentLayout>
        </AppLayout>
    );
}
