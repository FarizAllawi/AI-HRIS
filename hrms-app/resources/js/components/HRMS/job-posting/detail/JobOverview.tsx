import { Badge } from '@/components/ui/badge';
import {
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconCheckbox,
  IconCurrencyDollar,
  IconEye,
  IconFileText,
  IconId,
  IconListCheck,
  IconMapPin,
  IconX,
} from '@tabler/icons-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
type ArrayItem = {
  id: string;
  value: string;
}

type Props = {
  jobPosting: {
    id: string;
    dateCreated: string;
    publishedStatus: string;
    employmentType?: string;
    location?: string;
    department?: string;
    description?: string;
    salary?: string;
    requirements?: ArrayItem[];
    responsibilities?: ArrayItem[];
    qualifications?: ArrayItem[];
    required_skills?: ArrayItem[];
    preferred_skills?: ArrayItem[];
    benefits?: ArrayItem[];
  };
};

export default function JobOverview({ jobPosting }: Props) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getEmploymentTypeBadge = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'part-time':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'intern':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatBadgeText = (text: string) => {
    return text
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="w-auto rounded-lg border bg-card p-4 md:p-6">
      <div className="mb-4 flex items-center space-x-2">
        <IconEye className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <h3 className="text-lg font-semibold">Job Overview</h3>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-1/2 flex items-center space-x-2">
            <IconId className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium">Job ID</span>
          </div>
          <span className="w-1/2 text-end font-mono text-sm text-muted-foreground">
            {jobPosting.id}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-1/2 flex items-center space-x-2">
            <IconCalendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-sm font-medium">Created</span>
          </div>
          <div className="w-1/2 text-sm text-end">
            {new Date(jobPosting.dateCreated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-1/2 flex items-center space-x-2">
            <IconEye className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <div className="w-1/2 text-end">
            <Badge variant={getStatusBadgeVariant(jobPosting.publishedStatus)} className="text-xs">
              {formatBadgeText(jobPosting.publishedStatus || 'Draft')}
            </Badge>
          </div>
        </div>

        {jobPosting.employmentType && (
          <div className="flex items-center justify-between">
            <div className="w-1/2 flex items-center space-x-2">
              <IconBriefcase className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-medium">Type</span>
            </div>
            <div className="w-1/2 text-end">
              <Badge className={`text-xs ${getEmploymentTypeBadge(jobPosting.employmentType)}`}>
                {formatBadgeText(jobPosting.employmentType)}
              </Badge>
            </div>
          </div>
        )}

        {jobPosting.location && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconMapPin className="h-4 w-4 text-red-500 dark:text-red-400" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <span className="text-sm text-right">{jobPosting.location}</span>
          </div>
        )}

        {jobPosting.department && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconBuilding className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-sm font-medium">Department</span>
            </div>
            <span className="text-sm text-right">{jobPosting.department}</span>
          </div>
        )}

        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="description"
        >
          <AccordionItem value="description">
            <AccordionTrigger className="items-center">
              <div className="flex items-center space-x-2">
                <IconFileText className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <h3 className="text-lg font-semibold">Job Description</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="prose prose-sm max-w-none">
                {jobPosting.description ? (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {jobPosting.description}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No description provided
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="requirements">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <IconCheckbox className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-semibold">Requirements</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.requirements?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {jobPosting.requirements && jobPosting.requirements.length > 0 ? (
                  jobPosting.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rounded-md border bg-red-50/50 p-3 dark:bg-red-950/20"
                    >
                      <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500 dark:bg-red-400" />
                      <span className="text-sm leading-relaxed">{requirement?.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
                    <IconX className="h-4 w-4" />
                    <span>No requirements specified</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="responsibilities">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <IconListCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h3 className="text-lg font-semibold">Responsibilities</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.responsibilities?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {jobPosting.responsibilities && jobPosting.responsibilities.length > 0 ? (
                  jobPosting.responsibilities.map((responsibility, index) => (
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="qualifications">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <IconCheckbox className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-semibold">Qualifications</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.qualifications?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {jobPosting.qualifications && jobPosting.qualifications.length > 0 ? (
                  jobPosting.qualifications.map((qualification, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rounded-md border bg-red-50/50 p-3 dark:bg-red-950/20"
                    >
                      <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500 dark:bg-red-400" />
                      <span className="text-sm leading-relaxed">{qualification.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
                    <IconX className="h-4 w-4" />
                    <span>No Qualifications specified</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="required-skills">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <IconCheckbox className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-semibold">Required Skills</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.required_skills?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {jobPosting.required_skills && jobPosting.required_skills.length > 0 ? (
                  jobPosting.required_skills.map((required, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rounded-md border bg-red-50/50 p-3 dark:bg-red-950/20"
                    >
                      <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500 dark:bg-red-400" />
                      <span className="text-sm leading-relaxed">{required.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
                    <IconX className="h-4 w-4" />
                    <span>No Required Skills specified</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="preferred-skills">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <IconCheckbox className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-semibold">Preferred Skills</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.preferred_skills?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {jobPosting.preferred_skills && jobPosting.preferred_skills.length > 0 ? (
                  jobPosting.preferred_skills.map((preferred, index) => (
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="benefits">
            <AccordionTrigger>
              <div className="flex items-center space-x-2">
                <IconListCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h3 className="text-lg font-semibold">Benefits</h3>
                <Badge variant="outline" className="ml-auto">
                  {jobPosting.benefits?.length || 0} items
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {jobPosting.benefits && jobPosting.benefits.length > 0 ? (
                  jobPosting.benefits.map((benefits, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rounded-md border bg-blue-50/50 p-3 dark:bg-blue-950/20"
                    >
                      <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
                      <span className="text-sm leading-relaxed">{benefits.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
                    <IconX className="h-4 w-4" />
                    <span>No benefits specified</span>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="compensation">
            <AccordionTrigger>
              <div className=" flex items-center space-x-2">
                <IconCurrencyDollar className="h-5 w-5 text-green-500 dark:text-green-400" />
                <h3 className="text-lg font-semibold">Compensation</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-md border bg-green-50/50 p-4 dark:bg-green-950/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {jobPosting.salary}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Base salary range
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
