import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { usePage } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";

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

  const { handleSubmit, formState: { errors, isSubmitting } } = form;
  const [submitStatus, setSubmitStatus] = React.useState<
    'draft' | 'published' | 'unpublish'
  >('draft');

  const handleFormSubmit = (data: JobPostingFormValues) => {
    onSubmit?.({ ...data, status: submitStatus });
    console.log("Submitted data:", { ...data, status: submitStatus });
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
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

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t py-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="submit"
                variant="outline"
                onClick={() => setSubmitStatus("draft")}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                type="submit"
                onClick={() => setSubmitStatus("published")}
                disabled={!isValid || isSubmitting}
                className="w-full dark:text-white sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? "Publishing..." : "Publish Job"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
