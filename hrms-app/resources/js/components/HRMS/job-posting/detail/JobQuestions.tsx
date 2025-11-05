import {
  IconX,
  IconQuestionMark,
  IconPencilQuestion,
} from '@tabler/icons-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import JobPosting from '@/pages/job-posting';
import { cn } from '@/lib/utils';
import * as React from 'react';

type QuestionItem = {
  id?: string;
  question: string;
  description: string;
  weight: string;
  mapped_competencies: string[]
}

type ArrayItem = {
  id: string;
  value: string;
}

type JobPosting = {
  requirements?: ArrayItem[];
  responsibilities?: ArrayItem[];
  qualifications?: ArrayItem[];
  required_skills?: ArrayItem[];
  preferred_skills?: ArrayItem[];
  questions?: QuestionItem[];
}

type CompetencyOption = {
  id: string;
  label: string;
  type: string;
}

type MappedCompetenciesProps = {
  jobPosting: JobPosting;
  value: string[];
}

type Props = {
  jobPosting: JobPosting
}

export default function JobQuestions({ jobPosting }: Props) {
  return (
   <div className="rounded-lg border bg-card p-6">
     <div className="mb-4 flex items-center space-x-2">
       <div>
         <IconQuestionMark className="h-5 w-5 text-blue-500 dark:text-blue-400" />
       </div>
       <h3 className="text-lg font-semibold">Job Questions</h3>
       <Badge variant="outline" className="ml-auto">
         {jobPosting.questions?.length || 0} items
       </Badge>
     </div>
     <Accordion
       type="single"
       className="w-full"
       defaultValue="question-0"
       collapsible
     >
       { jobPosting.questions !== undefined && jobPosting.questions.length > 0 ? (
          jobPosting.questions?.map((item, index)  => (
            <AccordionItem value={`question-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex flex-row items-center space-x-4">
                  <div>
                    <IconPencilQuestion className="h-4 w-4 text-blue-500 dark:text-red-400" />
                  </div>
                  <h4 className="text-base font-semibold">{item.question}</h4>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8 space-y-4 ">
                <div className="flex flex-row space-x-2">
                  <div className="w-1/3">Description of question</div>
                  <div className="w-2/3">
                    {item.description !== undefined && item.description !== null ? (
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    ):(
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
                        <IconX className="h-4 w-4" />
                        <span>Description not set</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row space-x-2">
                  <div className="w-1/3">Weight of question</div>
                  <div className="w-2/3">
                    <Badge variant="outline" className="ml-auto">{item.weight}</Badge>
                    <span className="ml-1 text-xs text-muted-foreground leading-relaxed">
                      {{
                        0.15: "Low — Minor impact on overall AI score (weight 0.15). Use for optional or general questions.",
                        0.2: "Medium — Moderate importance (weight 0.20). Suitable for standard or behavioral questions.",
                        0.35: "High — Strong influence on the AI score (weight 0.35). Recommended for key job competencies.",
                        0.5: "Very High — Critical question (weight 0.50). Use for must-have qualifications or essential experience.",
                      }[item.weight] || "Select a weight level to see its impact."}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row space-x-2">
                  <div className="w-1/3">Mapped of Competencies</div>
                  <div className="w-2/3">
                    {item.mapped_competencies !== undefined && item.mapped_competencies?.length > 0 ? (
                      <MappedCompetencies jobPosting={jobPosting} value={item.mapped_competencies} />
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-red-500 italic">
                        <IconX className="h-4 w-4" />
                        <span>Competency has not been linked to this question</span>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
       ) : (
         <div className="flex items-center space-x-2 text-sm text-muted-foreground italic">
           <IconX className="h-4 w-4" />
           <span>No questions specified</span>
         </div>
      )}
     </Accordion>
   </div>
  )
}

function MappedCompetencies({jobPosting, value}: MappedCompetenciesProps) {
  const requirements = jobPosting.requirements || [];
  const responsibilities = jobPosting.responsibilities || [];
  const qualifications = jobPosting.qualifications || [];
  const required_skills = jobPosting.required_skills || [];
  const preferred_skills = jobPosting.preferred_skills || [];

  // Merge all competency sources into a single list
  const competencyOptions: CompetencyOption[] = [
    ...requirements.map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "requirement",
    })),
    ...responsibilities.map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "responsibility",
    })),
    ...qualifications.map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "qualification",
    })),
    ...(required_skills || []).map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "required_skill",
    })),
    ...(preferred_skills || []).map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "preferred_skill",
    })),
  ];

  const selectedCompetencies = competencyOptions.filter((opt) =>
    value.includes(opt.id)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "requirement":
        return "py-1 px-2 rounded-md bg-blue-100 text-blue-700 capitalize";
      case "responsibility":
        return "py-1 px-2 rounded-md bg-green-100 text-green-700 capitalize";
      case "qualification":
        return "py-1 px-2 rounded-md bg-purple-100 text-purple-700 capitalize";
      case "required_skill":
        return "py-1 px-2 rounded-md bg-orange-100 text-orange-700 capitalize";
      case "preferred_skill":
        return "py-1 px-2 rounded-md bg-pink-100 text-pink-700 capitalize";
      default:
        return "py-1 px-2 rounded-md bg-gray-100 text-gray-700 capitalize";
    }
  };
  return (
    <>
      {selectedCompetencies.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedCompetencies.map((opt) => (
            <Badge
              key={opt.id}
              className={cn(
                "text-xs font-medium border-none",
                getTypeColor(opt.type)
              )}
            >
              [{opt.type.replace("_", " ")}] {opt.label}
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-sm text-red-500 italic">
          <IconX className="h-4 w-4" />
          <span>Competency has not been linked to this question</span>
        </div>
      )}
    </>
  )

}
