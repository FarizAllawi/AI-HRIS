import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarcodeIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  MapPinIcon,
} from 'lucide-react';

export type AppliedJobInfo = {
  title: string;
  department: string;
  dateApplied: string;
  location: string;
  code: string;
};

export default function AppliedJobCard({ job }: { job: AppliedJobInfo }) {
  return (
    <Card className="mb-3">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <BriefcaseIcon size={18} className="text-primary" />
        <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
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
          <span className="text-muted-foreground">
            {new Date(job.dateApplied).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
