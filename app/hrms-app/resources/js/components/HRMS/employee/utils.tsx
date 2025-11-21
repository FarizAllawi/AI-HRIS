import { Badge } from '@/components/ui/badge';
import type { EmploymentStatus } from './types';

export function getStatusBadge(status: EmploymentStatus) {
  const map: Record<
    EmploymentStatus,
    {
      label: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    active: { label: 'Active', variant: 'default' },
    on_leave: { label: 'On Leave', variant: 'secondary' },
    terminated: { label: 'Terminated', variant: 'destructive' },
    probation: { label: 'Probation', variant: 'outline' },
    inactive: { label: 'Inactive', variant: 'secondary' },
  };
  const conf = map[status];
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}

export function formatDate(dateIso?: string) {
  if (!dateIso) return '–';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString();
}

export function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}
