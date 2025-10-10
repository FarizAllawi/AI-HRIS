import React from 'react';

type Props = {
  jobPosting: {
    id: string;
    dateCreated: string;
    publishedStatus: string;
    employmentType?: string;
  };
};

export default function JobOverview({ jobPosting }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium">Overview</div>
      <div className="text-sm text-muted-foreground">ID: {jobPosting.id}</div>
      <div className="text-sm text-muted-foreground">Created: {new Date(jobPosting.dateCreated).toLocaleDateString()}</div>
      <div className="text-sm text-muted-foreground">Status: {jobPosting.publishedStatus}</div>
      <div className="text-sm text-muted-foreground">Type: {jobPosting.employmentType ?? '—'}</div>
    </div>
  );
}
