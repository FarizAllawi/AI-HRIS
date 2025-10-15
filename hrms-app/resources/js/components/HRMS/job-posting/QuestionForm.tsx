import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

const questionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      description: z.string().optional(),
    }),
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
      questions: initialValues?.questions || [
        { question: '', description: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit?.(data))}
      className="mx-auto max-w-xl space-y-6"
    >
      <div className="space-y-4">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="relative rounded border bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-500" />
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
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ question: '', description: '' })}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" /> Add Question
      </Button>
      <Button type="submit" className="mt-4 w-full">
        Save Questions
      </Button>
    </form>
  );
}
