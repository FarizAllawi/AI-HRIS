import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().optional().nullable(),
  question: z.string().min(1, "Question is required"),
  description: z.string().optional(),
  weight: z.number().min(0.15, "Weight must be at least 0.15").max(0.5, "Weight cannot exceed 0.5"),
  mapped_competencies: z.array(z.string().min(1, "At least one competency must be selected")).optional(),
});

const arrayItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  value: z.string().min(1, "This field is required"),
});

export const jobPostingSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  departments: z.string().optional(),
  requirements: z.array(arrayItemSchema).min(1, "At least one requirement is required"),
  responsibilities: z.array(arrayItemSchema).min(1, "At least one responsibility is required"),
  qualifications: z.array(arrayItemSchema).min(1, "At least one qualification is required"),
  required_skills: z.array(arrayItemSchema).nullable(),
  preferred_skills: z.array(arrayItemSchema).nullable(),
  benefits: z.array(arrayItemSchema).nullable(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship'], {
    errorMap: () => ({ message: "Please select a valid job type" }),
  }),
  salary: z.string().optional(),
  questions: z.array(questionSchema).optional(),
  status: z.enum(['draft', 'published', 'unpublish'], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
});

export type JobPostingFormValues = z.infer<typeof jobPostingSchema>;
