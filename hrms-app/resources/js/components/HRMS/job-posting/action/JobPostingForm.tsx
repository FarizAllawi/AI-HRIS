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
import { HelpCircle, Plus, Save, Trash2, Info } from 'lucide-react';

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
    z.object({
      value: z.string().min(1, 'Requirement is required'),
      mapped_competencies: z.array(z.string()).optional(),
    }),
  ),
  responsibilities: z.array(
    z.object({
      value: z.string().min(1, 'Responsibility is required'),
      mapped_competencies: z.array(z.string()).optional(),
    }),
  ),
  required_skills: z.array(
    z.object({
      value: z.string().min(1, 'Required skill is required'),
      mapped_competencies: z.array(z.string()).optional(),
    }),
  ),
  preferred_skills: z.array(
    z.object({
      value: z.string().min(1, 'Preferred skill is required'),
      mapped_competencies: z.array(z.string()).optional(),
    }),
  ),
  benefits: z
    .array(z.object({ value: z.string().min(1, 'Benefit is required') }))
    .optional(),
  questions: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      description: z.string().optional(),
      weight: z.string().optional(),
      mapped_competencies: z.array(z.string()).optional(),
      shortlist_threshold: z.string().optional(),
      flag_threshold: z.string().optional(),
      weight_version: z.string().optional(),
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
    watch,
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
          : [{ value: '', mapped_competencies: [] }],
      responsibilities:
        Array.isArray(initialValues?.responsibilities) &&
        initialValues.responsibilities.length > 0
          ? initialValues.responsibilities
          : [{ value: '', mapped_competencies: [] }],
      required_skills:
        Array.isArray(initialValues?.required_skills) &&
        initialValues.required_skills.length > 0
          ? initialValues.required_skills
          : [{ value: '', mapped_competencies: [] }],
      preferred_skills:
        Array.isArray(initialValues?.preferred_skills) &&
        initialValues.preferred_skills.length > 0
          ? initialValues.preferred_skills
          : [{ value: '', mapped_competencies: [] }],
      benefits:
        Array.isArray(initialValues?.benefits) &&
        initialValues.benefits.length > 0
          ? initialValues.benefits
          : [{ value: '' }],
      questions:
        Array.isArray(initialValues?.questions) &&
        initialValues.questions.length > 0
          ? initialValues.questions
          : [{ question: '', description: '', weight: '', mapped_competencies: [], shortlist_threshold: '', flag_threshold: '', weight_version: '' }],
    },
  });

  const { props } = usePage();
  const serverErrors = props.errors || {};

  // Watch all fields to generate competency IDs dynamically
  const requirements = watch('requirements');
  const responsibilities = watch('responsibilities');
  const requiredSkills = watch('required_skills');
  const preferredSkills = watch('preferred_skills');

  // Generate competency options dynamically
  const competencyOptions = React.useMemo(() => {
    const options: Array<{ id: string; label: string; type: string }> = [];

    requirements?.forEach((req, idx) => {
      if (req.value) {
        options.push({
          id: `requirement_${idx + 1}`,
          label: `Requirement ${idx + 1}: ${req.value.substring(0, 50)}${req.value.length > 50 ? '...' : ''}`,
          type: 'Requirement'
        });
      }
    });

    responsibilities?.forEach((resp, idx) => {
      if (resp.value) {
        options.push({
          id: `responsibility_${idx + 1}`,
          label: `Responsibility ${idx + 1}: ${resp.value.substring(0, 50)}${resp.value.length > 50 ? '...' : ''}`,
          type: 'Responsibility'
        });
      }
    });

    requiredSkills?.forEach((skill, idx) => {
      if (skill.value) {
        options.push({
          id: `required_skill_${idx + 1}`,
          label: `Required Skill ${idx + 1}: ${skill.value}`,
          type: 'Required Skill'
        });
      }
    });

    preferredSkills?.forEach((skill, idx) => {
      if (skill.value) {
        options.push({
          id: `preferred_skill_${idx + 1}`,
          label: `Preferred Skill ${idx + 1}: ${skill.value}`,
          type: 'Preferred Skill'
        });
      }
    });

    return options;
  }, [requirements, responsibilities, requiredSkills, preferredSkills]);

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
    fields: reqSkillFields,
    append: appendReqSkill,
    remove: removeReqSkill,
  } = useFieldArray({ control, name: 'required_skills' });
  const {
    fields: prefSkillFields,
    append: appendPrefSkill,
    remove: removePrefSkill,
  } = useFieldArray({ control, name: 'preferred_skills' });
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
    const transformed = {
      ...data,
      status: submitStatus,
      questions: data.questions.map((q) => ({
        question: q.question,
        description: q.description || undefined,
        weight: q.weight ? Number(q.weight) : undefined,
        mapped_competencies: q.mapped_competencies || [],
        shortlist_threshold: q.shortlist_threshold ? Number(q.shortlist_threshold) : undefined,
        flag_threshold: q.flag_threshold ? Number(q.flag_threshold) : undefined,
        weight_version: q.weight_version ? Number(q.weight_version) : undefined,
      })),
    } as unknown as JobPostingFormValues;

    onSubmit?.(transformed);
  };

  const CompetencyMultiSelect = ({
                                   name,
                                   value = [],
                                   onChange
                                 }: {
    name: string;
    value?: string[];
    onChange: (value: string[]) => void;
  }) => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>(value);

    React.useEffect(() => {
      setSelectedIds(value || []);
    }, [value]);

    const handleToggle = (id: string) => {
      const newSelected = selectedIds.includes(id)
        ? selectedIds.filter(item => item !== id)
        : [...selectedIds, id];
      setSelectedIds(newSelected);
      onChange(newSelected);
    };

    return (
      <div className="space-y-2">
        <div className="max-h-40 overflow-y-auto rounded border p-2">
          {competencyOptions.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Add requirements, responsibilities, or skills above to map them here
            </p>
          ) : (
            competencyOptions.map((option) => (
              <label key={option.id} className="flex items-start gap-2 py-1 hover:bg-gray-50 cursor-pointer px-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                  className="mt-1"
                />
                <span className="text-sm flex-1">
                  <span className="font-medium text-blue-600">[{option.type}]</span> {option.label}
                </span>
              </label>
            ))
          )}
        </div>
        {selectedIds.length > 0 && (
          <div className="text-xs text-gray-600">
            Selected: {selectedIds.join(', ')}
          </div>
        )}
      </div>
    );
  };

  console.log(initialValues);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
      {/* Info Banner */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">About Competency Mapping</p>
            <p>Each requirement, responsibility, and skill you add will be assigned a unique ID (e.g., <code className="bg-blue-100 px-1 rounded">requirement_1</code>, <code className="bg-blue-100 px-1 rounded">required_skill_2</code>). These IDs can then be mapped to screening questions to help automatically evaluate candidates based on their responses.</p>
          </div>
        </div>
      </div>

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
              <TooltipContent>The department, e.g., "Sales".</TooltipContent>
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
                <Label>Requirements (Qualifications)</Label>
              </TooltipTrigger>
              <TooltipContent>
                List the qualifications, education, or experience required for this job.
                Each will receive a unique ID for competency mapping.
              </TooltipContent>
            </Tooltip>
            {reqFields.map((field, idx) => (
              <div key={field.id} className="mb-4 space-y-2 p-3 bg-gray-50 rounded">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">Requirement {idx + 1}</Label>
                    <Input
                      id={`requirements.${idx}.value`}
                      {...register(`requirements.${idx}.value`)}
                      placeholder="e.g., Bachelor's degree in Computer Science"
                      className="mt-1"
                    />
                  </div>
                  {reqFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeReq(idx)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Map to Competencies (Optional)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Link this requirement to specific skills or responsibilities for automated candidate screening
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Controller
                    name={`requirements.${idx}.mapped_competencies`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CompetencyMultiSelect
                        name={`requirements.${idx}.mapped_competencies`}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendReq({ value: '', mapped_competencies: [] })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Requirement
            </Button>
            {errors.requirements && (
              <span className="text-sm text-red-500">
                {errors.requirements.message}
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
                Each will receive a unique ID for competency mapping.
              </TooltipContent>
            </Tooltip>
            {respFields.map((field, idx) => (
              <div key={field.id} className="mb-4 space-y-2 p-3 bg-gray-50 rounded">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">Responsibility {idx + 1}</Label>
                    <Input
                      id={`responsibilities.${idx}.value`}
                      {...register(`responsibilities.${idx}.value`)}
                      placeholder="e.g., Lead development of new features"
                      className="mt-1"
                    />
                  </div>
                  {respFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeResp(idx)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Map to Competencies (Optional)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Link this responsibility to required skills or qualifications
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Controller
                    name={`responsibilities.${idx}.mapped_competencies`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CompetencyMultiSelect
                        name={`responsibilities.${idx}.mapped_competencies`}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendResp({ value: '', mapped_competencies: [] })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Responsibility
            </Button>
            {errors.responsibilities && (
              <span className="text-sm text-red-500">
                {errors.responsibilities.message}
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
                  placeholder="e.g., Health insurance, Remote work"
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
              <Plus className="h-4 w-4 mr-2" /> Add Benefit
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Required Skills */}
          <div className="space-y-4 rounded-lg border p-6 shadow">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Required Skills</Label>
              </TooltipTrigger>
              <TooltipContent>
                List the must-have technical or soft skills for this job.
                Each will receive a unique ID for competency mapping.
              </TooltipContent>
            </Tooltip>
            {reqSkillFields.map((field, idx) => (
              <div key={field.id} className="mb-4 space-y-2 p-3 bg-gray-50 rounded">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">Required Skill {idx + 1}</Label>
                    <Input
                      id={`required_skills.${idx}.value`}
                      {...register(`required_skills.${idx}.value`)}
                      placeholder="e.g., Python, Leadership"
                      className="mt-1"
                    />
                  </div>
                  {reqSkillFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeReqSkill(idx)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Map to Competencies (Optional)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Link this skill to related requirements or responsibilities
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Controller
                    name={`required_skills.${idx}.mapped_competencies`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CompetencyMultiSelect
                        name={`required_skills.${idx}.mapped_competencies`}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendReqSkill({ value: '', mapped_competencies: [] })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Required Skill
            </Button>
            {errors.required_skills && (
              <span className="text-sm text-red-500">
                {errors.required_skills.message}
              </span>
            )}
          </div>

          {/* Preferred Skills */}
          <div className="space-y-4 rounded-lg border p-6 shadow">
            <Tooltip>
              <TooltipTrigger asChild>
                <Label>Preferred Skills</Label>
              </TooltipTrigger>
              <TooltipContent>
                List the nice-to-have skills that would be advantageous.
                Each will receive a unique ID for competency mapping.
              </TooltipContent>
            </Tooltip>
            {prefSkillFields.map((field, idx) => (
              <div key={field.id} className="mb-4 space-y-2 p-3 bg-gray-50 rounded">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600">Preferred Skill {idx + 1}</Label>
                    <Input
                      id={`preferred_skills.${idx}.value`}
                      {...register(`preferred_skills.${idx}.value`)}
                      placeholder="e.g., PyTorch, Public Speaking"
                      className="mt-1"
                    />
                  </div>
                  {prefSkillFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removePrefSkill(idx)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-600">
                    Map to Competencies (Optional)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Link this preferred skill to related competencies
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Controller
                    name={`preferred_skills.${idx}.mapped_competencies`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <CompetencyMultiSelect
                        name={`preferred_skills.${idx}.mapped_competencies`}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendPrefSkill({ value: '', mapped_competencies: [] })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Preferred Skill
            </Button>
            {errors.preferred_skills && (
              <span className="text-sm text-red-500">
                {errors.preferred_skills.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="mt-8 space-y-6 rounded-lg border p-6 shadow">
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Screening Questions for Applicants
          </h2>
          <p className="text-sm text-gray-600">
            Create questions to screen candidates automatically. Map questions to competencies above to enable AI-powered evaluation.
          </p>
        </div>
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="relative rounded border p-4 bg-gray-50">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Question {idx + 1}
                </Label>
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

              {/* Question Text */}
              <div className="mb-3">
                <Label htmlFor={`questions.${idx}.question`}>
                  Question Text *
                </Label>
                <Input
                  id={`questions.${idx}.question`}
                  {...register(`questions.${idx}.question`)}
                  placeholder="e.g., Describe your experience with Python"
                  className="mt-1"
                />
                {errors.questions?.[idx]?.question && (
                  <span className="text-sm text-red-500">
                    {errors.questions[idx]?.question?.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-3">
                <Label htmlFor={`questions.${idx}.description`}>
                  Description (Optional)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Additional context or instructions for the candidate
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id={`questions.${idx}.description`}
                  {...register(`questions.${idx}.description`)}
                  rows={2}
                  placeholder="Provide additional context for this question"
                  className="mt-1"
                />
              </div>

              {/* Weight */}
              <div className="mb-3">
                <Label htmlFor={`questions.${idx}.weight`}>
                  Weight (Optional)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Importance of this question in overall scoring (e.g., 10 = high importance)
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id={`questions.${idx}.weight`}
                  {...register(`questions.${idx}.weight`)}
                  type="number"
                  placeholder="e.g., 10"
                  className="mt-1"
                />
              </div>

              {/* Mapped Competencies */}
              <div className="mb-3">
                <Label>
                  Map to Competencies
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select which requirements, skills, or responsibilities this question evaluates.
                      This enables automatic candidate scoring based on their answers.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Controller
                  name={`questions.${idx}.mapped_competencies`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CompetencyMultiSelect
                      name={`questions.${idx}.mapped_competencies`}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              {/* Thresholds */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor={`questions.${idx}.shortlist_threshold`}>
                    Shortlist Threshold
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Minimum score (0-100) for a candidate to be shortlisted based on this question
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id={`questions.${idx}.shortlist_threshold`}
                    {...register(`questions.${idx}.shortlist_threshold`)}
                    type="number"
                    placeholder="e.g., 70"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`questions.${idx}.flag_threshold`}>
                    Flag Threshold
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Score below which candidates are flagged for review (e.g., 40 = needs attention)
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id={`questions.${idx}.flag_threshold`}
                    {...register(`questions.${idx}.flag_threshold`)}
                    type="number"
                    placeholder="e.g., 40"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`questions.${idx}.weight_version`}>
                    Weight Version
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline h-3 w-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Version number for weight configuration (for A/B testing or updates)
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id={`questions.${idx}.weight_version`}
                    {...register(`questions.${idx}.weight_version`)}
                    type="number"
                    placeholder="e.g., 1"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              question: '',
              description: '',
              weight: '',
              mapped_competencies: [],
              shortlist_threshold: '',
              flag_threshold: '',
              weight_version: ''
            })
          }
          className="flex w-full items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      {/* Submit Buttons */}
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
