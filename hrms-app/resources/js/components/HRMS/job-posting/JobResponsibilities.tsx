import React from 'react';

type Props = {
  responsibilities?: string[];
};

export default function JobResponsibilities({ responsibilities }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium">Responsibilities</div>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {(responsibilities ?? []).map((r, i) => (<li key={i}>{r}</li>))}
      </ul>
    </div>
  );
}
