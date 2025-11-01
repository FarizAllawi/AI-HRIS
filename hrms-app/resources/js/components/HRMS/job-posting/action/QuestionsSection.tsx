import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CompetencyMultiSelect } from "./CompetencyMultiSelect";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";

export function QuestionsSection({ form }: any) {
  const { control, register, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });
  const [weight, setWeight] = React.useState(0.2);

  return (
    <TooltipProvider>
      <div className="space-y-6 rounded-lg border p-6 shadow-sm bg-white">
        <h2 className="text-lg font-semibold">Interview / Screening Questions</h2>
        <p className="text-sm text-muted-foreground">
          Define the questions and their importance. These will be used to assess candidates using the AI model.
        </p>

        {fields.map((field, i) => (
          <div key={field.id} className="space-y-4 border p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Question #{i + 1}</h3>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(i)}>
                Remove
              </Button>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <Label>Question</Label>
              <Input
                placeholder="e.g., How do you ensure code quality in large projects?"
                {...register(`questions.${i}.question`)}
              />
              {errors.questions?.[i]?.question && (
                <span className="text-sm text-red-500">{errors.questions?.[i].question.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description or context for this question"
                {...register(`questions.${i}.description`)}
              />
            </div>

            {/* Mapped Competencies */}
            <div className="space-y-1">
              <Label>Mapped Competencies</Label>
              <CompetencyMultiSelect
                form={form}
                value={watch(`questions.${i}.mapped_competencies`) || []}
                onChange={(val) => form.setValue(`questions.${i}.mapped_competencies`, val)}
              />
              {errors.questions?.[i]?.mapped_competencies && (
                <span className="text-sm text-red-500">{errors.questions?.[i].mapped_competencies.message}</span>
              )}
            </div>

        <div className="space-y-2">
          <Label>Question Weight</Label>
          <Select
            value={watch(`questions.${i}.weight`).toString()}
            onValueChange={(val) => {
              form.setValue(`questions.${i}.weight`, parseFloat(val));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select weight" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">Very High (Critical – 0.5)</SelectItem>
              <SelectItem value="0.35">High (Important – 0.35)</SelectItem>
              <SelectItem value="0.2">Medium (Moderate – 0.2)</SelectItem>
              <SelectItem value="0.15">Low (Supporting – 0.15)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {{
              0.15: "Low — Minor impact on overall AI score (weight 0.15). Use for optional or general questions.",
              0.2: "Medium — Moderate importance (weight 0.20). Suitable for standard or behavioral questions.",
              0.35: "High — Strong influence on the AI score (weight 0.35). Recommended for key job competencies.",
              0.5: "Very High — Critical question (weight 0.50). Use for must-have qualifications or essential experience.",
            }[weight] || "Select a weight level to see its impact."}
          </p>
          {errors.questions?.[i]?.weight && (
            <span className="text-sm text-red-500">{errors.questions?.[i].weight.message}</span>
          )}
        </div>

      </div>
        ))}

        <Button
          type="button"
          onClick={() => append({ question: "", weight: 0.3 })}
          variant="secondary"
        >
          + Add Question
        </Button>
      </div>
    </TooltipProvider>
  );
}
