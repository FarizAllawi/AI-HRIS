import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppliedJobWithAnswers, {
  AppliedJobWithAnswersProps,
} from './AppliedJobWithAnswers';

export default function AppliedJobFilter({
  appliedJobsWithAnswers,
}: {
  appliedJobsWithAnswers: AppliedJobWithAnswersProps[];
}) {
  if (!appliedJobsWithAnswers || appliedJobsWithAnswers.length === 0) {
    return null;
  }
  const firstCode = appliedJobsWithAnswers[0]?.job.code || '';
  return (
    <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
      <Tabs defaultValue={firstCode} className="w-full">
        <TabsList className="mb-6 flex flex-wrap place-content-center items-center gap-2 rounded-lg bg-muted p-2">
          {appliedJobsWithAnswers.map((item) => (
            <TabsTrigger
              key={item.job.code}
              value={item.job.code}
              className="rounded-lg border px-6 py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-muted-foreground"
            >
              <span className="text-base font-medium">{item.job.title}</span>
              <span className="ml-1 text-sm text-muted-foreground">{item.job.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {appliedJobsWithAnswers.map((item) => (
          <TabsContent key={item.job.code} value={item.job.code}>
            <AppliedJobWithAnswers job={item.job} answers={item.answers} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
