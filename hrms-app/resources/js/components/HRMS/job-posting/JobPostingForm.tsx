import { usePage } from '@inertiajs/react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import { HelpCircle, Plus, Save, Trash2 } from 'lucide-react';

const jobTypes = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
};
const jobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().optional(),
  departments: z.string().optional(),
  salary: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  status: z.enum(['draft', 'published', 'unpublish']),
  requirements: z.array(
    z.object({ value: z.string().min(1, 'Requirement is required') }),
  ),
  responsibilities: z.array(
    z.object({ value: z.string().min(1, 'Responsibility is required') }),
  ),
  benefits: z
    .array(z.object({ value: z.string().min(1, 'Benefit is required') }))
    .optional(),
  questions: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      description: z.string().optional(),
      weight: z.string().optional(),
    }),
  ),
});

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

export function JobPostingForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: Partial<JobPostingFormValues>;
  onSubmit?: (values: JobPostingFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      location: initialValues?.location || '',
      departments: initialValues?.departments || '',
      salary: initialValues?.salary || '',
      type: initialValues?.type || 'full-time',
      status: initialValues?.status || 'draft',
      requirements:
        Array.isArray(initialValues?.requirements) &&
        initialValues.requirements.length > 0
          ? initialValues.requirements
          : [{ value: '' }],
      responsibilities:
        Array.isArray(initialValues?.responsibilities) &&
        initialValues.responsibilities.length > 0
          ? initialValues.responsibilities
          : [{ value: '' }],
      benefits:
        Array.isArray(initialValues?.benefits) &&
        initialValues.benefits.length > 0
          ? initialValues.benefits
          : [{ value: '' }],
      questions:
        Array.isArray(initialValues?.questions) &&
        initialValues.questions.length > 0
          ? initialValues.questions
          : [{ question: '', description: '', weight: '' }],
    },
  });

  // inside component
  const { props } = usePage();
  const serverErrors = props.errors || {};

  const {
    fields: reqFields,
    append: appendReq,
    remove: removeReq,
  } = useFieldArray({ control, name: 'requirements' });
  const {
    fields: respFields,
    append: appendResp,
    remove: removeResp,
  } = useFieldArray({
    control,
    name: 'responsibilities',
  });
  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: 'benefits',
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const [submitStatus, setSubmitStatus] = React.useState<
    'draft' | 'published' | 'unpublish'
  >('draft');

  const handleFormSubmit = (data: JobPostingFormValues) => {
    onSubmit?.({ ...data, status: submitStatus });
  };

  console.log(initialValues);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6 rounded-lg border p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">Job Overview</h2>

          {/* Title */}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="title">Title</Label>
              </TooltipTrigger>
              <TooltipContent>
                The job title, e.g., "Software Engineer" or "HR Manager".
              </TooltipContent>
            </Tooltip>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <span className="text-sm text-red-500">
                {errors.title.message}
              </span>
            )}
            {serverErrors.title && (
              <span className="text-sm text-red-500">
                {serverErrors.title.message}
              </span>
            )}
          </div>

          {/* Description*/}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="description">Description</Label>
              </TooltipTrigger>
              <TooltipContent>
                A brief summary of the job and its main objectives.
              </TooltipContent>
            </Tooltip>
            <Textarea id="description" {...register('description')} rows={3} />
            {errors.description && (
              <span className="text-sm text-red-500">
                {errors.description.message}
              </span>
            )}
            {serverErrors.description && (
              <span className="text-sm text-red-500">
                {serverErrors.description.message}
              </span>
            )}
          </div>

          {/*  Type */}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="type">Type</Label>
              </TooltipTrigger>
              <TooltipContent>
                The employment type, e.g., Full Time, Part Time, Contract, or
                Internship.
              </TooltipContent>
            </Tooltip>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={jobTypes[0]}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(jobTypes).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <span className="text-sm text-red-500">
                {errors.type.message}
              </span>
            )}
            {serverErrors.type && (
              <span className="text-sm text-red-500">
                {serverErrors.type.message}
              </span>
            )}
          </div>

          {/* Location*/}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="location">Location</Label>
              </TooltipTrigger>
              <TooltipContent>
                The Location, e.g., "Jakarta, Indonesia".
              </TooltipContent>
            </Tooltip>
            <Input id="location" {...register('location')} />
            {errors.location && (
              <span className="text-sm text-red-500">
                {errors.location.message}
              </span>
            )}
            {serverErrors.location && (
              <span className="text-sm text-red-500">
                {serverErrors.location.message}
              </span>
            )}
          </div>

          {/*  Department */}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="department">Department</Label>
              </TooltipTrigger>
              <TooltipContent>The Location, e.g., "Sales".</TooltipContent>
            </Tooltip>
            <Input id="departments" {...register('departments')} />
            {errors.departments && (
              <span className="text-sm text-red-500">
                {errors.departments.message}
              </span>
            )}
            {serverErrors.departments && (
              <span className="text-sm text-red-500">
                {serverErrors.departments.message}
              </span>
            )}
          </div>

          {/*  Salary */}
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="salary">Salary</Label>
              </TooltipTrigger>
              <TooltipContent>
                The Salary of the job, e.g., "IDR 10,000,000 - 18,000,000 /
                month".
              </TooltipContent>
            </Tooltip>
            <Input id="salary" {...register('salary')} />
            {errors.salary && (
              <span className="text-sm text-red-500">
                {errors.salary.message}
              </span>
            )}
            {serverErrors.salary && (
              <span className="text-sm text-red-500">
                {serverErrors.salary.message}
              </span>
            )}
          </div>

          {/*  Requirements */}
          <div className="space-y-4 rounded-lg border p-6 shadow">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Requirements</Label>
              </TooltipTrigger>
              <TooltipContent>
                List the qualifications, skills, or experience required for this
                job.
              </TooltipContent>
            </Tooltip>
            {reqFields.map((field, idx) => (
              <div key={field.id} className="mb-2 flex items-center gap-2">
                <Input
                  id={`requirements.${idx}.value`}
                  {...register(`requirements.${idx}.value`)}
                  placeholder="Enter requirement"
                />
                {reqFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeReq(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendReq({ value: '' })}
              className="mb-2 w-full"
            >
              + Add Requirement
            </Button>
            {errors.requirements && (
              <span className="text-sm text-red-500">
                {errors.requirements.message}
              </span>
            )}
            {serverErrors.requirements && (
              <span className="text-sm text-red-500">
                {serverErrors.requirements.message}
              </span>
            )}
          </div>

          {/* Responsibilities*/}
          <div className="space-y-4 rounded-lg border p-6 shadow">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Responsibilities</Label>
              </TooltipTrigger>
              <TooltipContent>
                Outline the main duties and responsibilities for this position.
              </TooltipContent>
            </Tooltip>
            {respFields.map((field, idx) => (
              <div key={field.id} className="mb-2 flex items-center gap-2">
                <Input
                  id={`responsibilities.${idx}.value`}
                  {...register(`responsibilities.${idx}.value`)}
                  placeholder="Enter responsibility"
                />
                {respFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeResp(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendResp({ value: '' })}
              className="mb-2 w-full"
            >
              + Add Responsibility
            </Button>
            {errors.responsibilities && (
              <span className="text-sm text-red-500">
                {errors.responsibilities.message}
              </span>
            )}
            {serverErrors.responsibilities && (
              <span className="text-sm text-red-500">
                {serverErrors.responsibilities.message}
              </span>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-4 rounded-lg border p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Benefits</h2>
            {benefitFields.map((field, idx) => (
              <div key={field.id} className="mb-2 flex items-center gap-2">
                <Input
                  {...register(`benefits.${idx}.value`)}
                  placeholder="Enter benefit"
                />
                {benefitFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeBenefit(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendBenefit({ value: '' })}
              className="w-full"
            >
              <Plus className="h-4 w-4" /> Add Benefit
            </Button>
          </div>
        </div>
        <div className="space-y-6 rounded-lg border p-6 shadow">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Questions for Applicant
          </h2>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="relative rounded border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`questions.${idx}.question`}>
                      Question {idx + 1}
                    </Label>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  id={`questions.${idx}.question`}
                  {...register(`questions.${idx}.question`)}
                  placeholder="Enter question"
                />
                {errors.questions?.[idx]?.question && (
                  <span className="text-sm text-red-500">
                    {errors.questions[idx]?.question?.message}
                  </span>
                )}
                {serverErrors.questions?.[idx]?.question && (
                  <span className="text-sm text-red-500">
                    {serverErrors.questions[idx]?.question?.message}
                  </span>
                )}
                <div className="mt-2">
                  <Label htmlFor={`questions.${idx}.description`}>
                    Description (optional)
                  </Label>
                  <Textarea
                    id={`questions.${idx}.description`}
                    {...register(`questions.${idx}.description`)}
                    rows={2}
                    placeholder="Enter description"
                  />
                </div>
                <div className="mt-2">
                  <Label htmlFor={`questions.${idx}.weight`}>
                    Weight (optional)
                  </Label>
                  <Input
                    id={`questions.${idx}.weight`}
                    {...register(`questions.${idx}.weight`)}
                    placeholder="Enter weight (e.g. 10)"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ question: '', description: '', weight: '' })
            }
            className="flex w-full items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>
      <div className="mt-8 flex w-full justify-center gap-4">
        <Button
          type="submit"
          variant="outline"
          className="flex w-1/2 items-center gap-2"
          onClick={() => setSubmitStatus('draft')}
        >
          <Save className="h-4 w-4" /> Save as Draft
        </Button>
        <Button
          type="submit"
          className="flex w-1/2 items-center gap-2"
          onClick={() => setSubmitStatus('published')}
        >
          <Save className="h-4 w-4" /> Publish
        </Button>
      </div>
    </form>
  );
}
