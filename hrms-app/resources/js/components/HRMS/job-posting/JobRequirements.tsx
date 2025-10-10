import React from 'react';

type Props = {
  requirements?: string[];
};

export default function JobRequirements({ requirements }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium">Requirements</div>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {(requirements ?? []).map((r, i) => (<li key={i}>{r}</li>))}
      </ul>
    </div>
  );
}
