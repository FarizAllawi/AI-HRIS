import React from 'react';
import { BriefcaseIcon, BuildingIcon, MapPinIcon, CalendarIcon, BarcodeIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export type AppliedJobInfo = {
  title: string;
  department: string;
  dateApplied: string;
  location: string;
  code: string;
};

const dummyJob: AppliedJobInfo = {
  title: 'Frontend Developer',
  department: 'Engineering',
  dateApplied: '2025-10-01',
  location: 'Jakarta',
  code: 'FD-2025',
};

export default function AppliedJobCard({ job = dummyJob }: { job?: AppliedJobInfo }) {
  return (
    <Card className="mb-3">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <BriefcaseIcon size={18} className="text-primary" />
        <CardTitle className="text-base font-semibold">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <BuildingIcon size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{job.department}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPinIcon size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <BarcodeIcon size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{job.code}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon size={14} className="text-muted-foreground" />
          <span className="text-muted-foreground">{new Date(job.dateApplied).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
