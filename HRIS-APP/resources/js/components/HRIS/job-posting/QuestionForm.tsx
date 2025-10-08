import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

const questionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      description: z.string().optional(),
    })
  ),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

export default function QuestionForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: Partial<QuestionFormValues>;
  onSubmit?: (values: QuestionFormValues) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questions: initialValues?.questions || [{ question: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit?.(data))} className="space-y-6 max-w-xl mx-auto">
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div key={field.id} className="border rounded p-4 relative bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
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
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={() => append({ question: '', description: '' })} className="flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add Question
      </Button>
      <Button type="submit" className="w-full mt-4">Save Questions</Button>
    </form>
  );
}
