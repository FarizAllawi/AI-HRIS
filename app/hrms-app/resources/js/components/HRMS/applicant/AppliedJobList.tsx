import AppliedJobCard, { AppliedJobInfo } from './AppliedJobCard';

const dummyJobs: AppliedJobInfo[] = [
  {
    title: 'Frontend Developer',
    department: 'Engineering',
    dateApplied: '2025-10-01',
    location: 'Jakarta',
    code: 'FD-2025',
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    dateApplied: '2025-09-15',
    location: 'Bandung',
    code: 'UX-2025',
  },
];

export default function AppliedJobList({
  jobs = dummyJobs,
}: {
  jobs?: AppliedJobInfo[];
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-lg font-bold">Applied Jobs</div>
      <div className="space-y-2">
        {jobs.map((job, idx) => (
          <AppliedJobCard key={idx} job={job} />
        ))}
      </div>
    </div>
  );
}
