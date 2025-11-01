import { Badge } from '@/components/ui/badge';
import { IconCheckbox, IconX } from '@tabler/icons-react';

type ArrayItem = {
  id?: string;
  value: string;
}

type Props = {
  preferred_skills?: ArrayItem[];
};

export default function JobPreferredSkills({ preferred_skills }: Props) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <IconCheckbox className="h-5 w-5 text-red-500 dark:text-red-400" />
        <h3 className="text-lg font-semibold">Preferred Skills</h3>
        <Badge variant="outline" className="ml-auto">
          {preferred_skills?.length || 0} items
        </Badge>
      </div>

      <div className="space-y-3">
        {preferred_skills && preferred_skills.length > 0 ? (
          preferred_skills.map((preferred, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 rounded-md border bg-red-50/50 p-3 dark:bg-red-950/20"
            >
              <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500 dark:bg-red-400" />
              <span className="text-sm leading-relaxed">{preferred?.value}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
            <IconX className="h-4 w-4" />
            <span>No Preferred Skills specified</span>
          </div>
        )}
      </div>
    </div>
  );
}
