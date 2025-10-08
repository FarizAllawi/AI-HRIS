import React from 'react';

type Props = {
  description?: string;
};

export default function JobDescription({ description }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium">Description</div>
      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{description ?? '—'}</div>
    </div>
  );
}
