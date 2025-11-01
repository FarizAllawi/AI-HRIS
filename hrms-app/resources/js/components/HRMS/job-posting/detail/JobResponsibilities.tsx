import { Badge } from '@/components/ui/badge';
import { IconListCheck, IconX } from '@tabler/icons-react';

type ArrayItem = {
  id?: string;
  value: string;
}

type Props = {
  responsibilities?: ArrayItem[];
};

export default function JobResponsibilities({ responsibilities }: Props) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <IconListCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <h3 className="text-lg font-semibold">Responsibilities</h3>
        <Badge variant="outline" className="ml-auto">
          {responsibilities?.length || 0} items
        </Badge>
      </div>

      <div className="space-y-3">
        {responsibilities && responsibilities.length > 0 ? (
          responsibilities.map((responsibility, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 rounded-md border bg-blue-50/50 p-3 dark:bg-blue-950/20"
            >
              <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
              <span className="text-sm leading-relaxed">{responsibility.value}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
            <IconX className="h-4 w-4" />
            <span>No responsibilities specified</span>
          </div>
        )}
      </div>
    </div>
  );
}
