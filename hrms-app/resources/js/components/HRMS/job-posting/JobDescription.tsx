import { IconFileText } from '@tabler/icons-react';

type Props = {
  description?: string;
};

export default function JobDescription({ description }: Props) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <IconFileText className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        <h3 className="text-lg font-semibold">Job Description</h3>
      </div>

      <div className="prose prose-sm max-w-none">
        {description ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {description}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No description provided
          </div>
        )}
      </div>
    </div>
  );
}
