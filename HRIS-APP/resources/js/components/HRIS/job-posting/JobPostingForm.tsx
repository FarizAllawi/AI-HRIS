import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, HelpCircle, Save } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const jobTypes = [
  'Full Time',
  'Part Time',
  'Contract',
  'Internship',
];

const jobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
  requirements: z.array(z.object({ value: z.string().min(1, 'Requirement is required') })), // array of objects
  responsibilities: z.array(z.object({ value: z.string().min(1, 'Responsibility is required') })), // array of objects
  questions: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      description: z.string().optional(),
      weight: z.string().optional(),
    })
  ),
});

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

export default function JobPostingForm({
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
      type: initialValues?.type || jobTypes[0],
      requirements: initialValues?.requirements || [{ value: '' }], // array of objects
      responsibilities: initialValues?.responsibilities || [{ value: '' }], // array of objects
      questions: initialValues?.questions || [{ question: '', description: '', weight: '' }],
    },
  });

  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control,
    name: 'requirements',
  });
  const { fields: respFields, append: appendResp, remove: removeResp } = useFieldArray({
    control,
    name: 'responsibilities',
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const [submitStatus, setSubmitStatus] = React.useState<'draft' | 'published'>('draft');

  const handleFormSubmit = (data: JobPostingFormValues) => {
    onSubmit?.({ ...data, status: submitStatus } as any); // status is not in schema, cast to any
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold mb-4">Job Overview</h2>
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
            {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
          </div>
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
            {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="type">Type</Label>
              </TooltipTrigger>
              <TooltipContent>
                The employment type, e.g., Full Time, Part Time, Contract, or Internship.
              </TooltipContent>
            </Tooltip>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={jobTypes[0]}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Requirements</Label>
              </TooltipTrigger>
              <TooltipContent>
                List the qualifications, skills, or experience required for this job.
              </TooltipContent>
            </Tooltip>
            {reqFields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <Input
                  id={`requirements.${idx}.value`}
                  {...register(`requirements.${idx}.value`)}
                  placeholder="Enter requirement"
                />
                {reqFields.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeReq(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendReq({ value: '' })} className="w-full mb-2">+ Add Requirement</Button>
            {errors.requirements && <span className="text-red-500 text-sm">{errors.requirements.message}</span>}
          </div>
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Responsibilities</Label>
              </TooltipTrigger>
              <TooltipContent>
                Outline the main duties and responsibilities for this position.
              </TooltipContent>
            </Tooltip>
            {respFields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <Input
                  id={`responsibilities.${idx}.value`}
                  {...register(`responsibilities.${idx}.value`)}
                  placeholder="Enter responsibility"
                />
                {respFields.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeResp(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendResp({ value: '' })} className="w-full mb-2">+ Add Responsibility</Button>
            {errors.responsibilities && <span className="text-red-500 text-sm">{errors.responsibilities.message}</span>}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-500" />Questions for Applicant</h2>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="border rounded p-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`questions.${idx}.question`}>Question {idx + 1}</Label>
                  </div>
                  {fields.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input
                  id={`questions.${idx}.question`}
                  {...register(`questions.${idx}.question`)}
                  placeholder="Enter question"
                />
                {errors.questions?.[idx]?.question && (
                  <span className="text-red-500 text-sm">{errors.questions[idx]?.question?.message}</span>
                )}
                <div className="mt-2">
                  <Label htmlFor={`questions.${idx}.description`}>Description (optional)</Label>
                  <Textarea
                    id={`questions.${idx}.description`}
                    {...register(`questions.${idx}.description`)}
                    rows={2}
                    placeholder="Enter description"
                  />
                </div>
                <div className="mt-2">
                  <Label htmlFor={`questions.${idx}.weight`}>Weight (optional)</Label>
                  <Input
                    id={`questions.${idx}.weight`}
                    {...register(`questions.${idx}.weight`)}
                    placeholder="Enter weight (e.g. 10)"
                  />
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={() => append({ question: '', description: '', weight: '' })} className="flex items-center gap-2 w-full">
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>
      <div className="w-full mt-8 flex justify-center gap-4">
        <Button
          type="submit"
          variant="outline"
          className="w-1/2 flex items-center gap-2"
          onClick={() => setSubmitStatus('draft')}
        >
          <Save className="w-4 h-4" /> Save as Draft
        </Button>
        <Button
          type="submit"
          className="w-1/2 flex items-center gap-2"
          onClick={() => setSubmitStatus('published')}
        >
          <Save className="w-4 h-4" /> Publish
        </Button>
      </div>
    </form>
  );
}
