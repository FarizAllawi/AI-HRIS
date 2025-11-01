import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { usePage } from "@inertiajs/react";

import { JobOverviewSection } from "./JobOverviewSection";
import { RequirementsSection } from "./RequirementsSection";
import { ResponsibilitiesSection } from "./ResponsibilitiesSection";
import { QualificationSection } from "./QualiticationSection";
import { SkillsSection } from "./SkillsSection";
import { BenefitsSection } from "./BenefitsSection";
import { QuestionsSection } from "./QuestionsSection";
import { jobPostingSchema, JobPostingFormValues } from "./schema";

export function JobPostingForm({
  initialValues,
  onSubmit,
} : {
  initialValues?: Partial<JobPostingFormValues>;
  onSubmit?: (values: JobPostingFormValues) => void;
}) {
  const { props } = usePage();
  const serverErrors = props.errors || {};

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      location: initialValues?.location || '',
      departments: initialValues?.departments || '',
      salary: initialValues?.salary || '',
      type: initialValues?.type || 'full-time',
      status: initialValues?.status || 'draft',
      requirements: initialValues?.requirements?.length
          ? initialValues.requirements
          : [{ id:"requirements_id_1", value: "" }],
      responsibilities: initialValues?.responsibilities?.length
          ? initialValues.responsibilities
          : [{ id:"responsibilities_id_1", value: "" }],
      qualifications: initialValues?.qualifications?.length
          ? initialValues.qualifications
          : [{ id:"qualifications_id_1", value: "" }],
      required_skills: initialValues?.required_skills?.length
          ? initialValues.required_skills
          : [{ id:"required_skils_id_1", value: "" }],
      preferred_skills: initialValues?.preferred_skills?.length
          ? initialValues.preferred_skills
          : [{ id:"preferred_skils_id_1", value: "" }],
      benefits: initialValues?.benefits?.length
          ? initialValues.benefits
          : [{ id:"benefits_id_1", value: "" }],
      questions:
        Array.isArray(initialValues?.questions) &&
        initialValues.questions.length > 0
          ? initialValues.questions
          : [{id: null, question: '', description: '', weight: 0, mapped_competencies: [] }],
    },
  });

  const { handleSubmit, formState: { errors } } = form;
  const [submitStatus, setSubmitStatus] = React.useState<
    'draft' | 'published' | 'unpublish'
  >('draft');

  const handleFormSubmit = (data: JobPostingFormValues) => {
    onSubmit?.({ ...data, status: submitStatus });
    console.log("Submitted data:", { ...data, status: submitStatus });
  };

  const isValid = Object.keys(errors).length === 0;

  console.log("jobPostingForm:", form.watch());
  console.log("formErrors:", errors);
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full space-y-6">
        <div className="flex flex-col lg:flex-row space-x-6">
            <div className="flex flex-col space-y-6 w-full lg:w-1/2">
                <JobOverviewSection form={form} serverErrors={serverErrors} />
                <RequirementsSection form={form} />
                <ResponsibilitiesSection form={form} />
                <QualificationSection form={form} />
                <BenefitsSection form={form} />
            </div>
            <div className="flex flex-col space-y-6 w-full lg:w-1/2">
                <SkillsSection form={form} />
                <QuestionsSection form={form} />
            </div>

        </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" onClick={() => setSubmitStatus("draft")}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={!isValid} onClick={() => setSubmitStatus("published")}>
          Publish
        </Button>
      </div>
    </form>
  );
}
