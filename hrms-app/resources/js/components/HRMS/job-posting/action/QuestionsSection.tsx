import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CompetencyMultiSelect } from "./CompetencyMultiSelect";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, HelpCircle, Trash2, FileQuestion, Brain, Target, Scale } from "lucide-react";
import { toast } from 'sonner';


export function QuestionsSection({ form }: any) {
  const { control, register, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  const handleAddQuestion = () => {
    const nextIndex = fields.length + 1;

    const currenQuestionValue = watch(`questions.${fields.length - 1}.question`);

    if (fields.length !== 0 && (!currenQuestionValue || currenQuestionValue.trim() === '')) {
      toast.warning("Please fill the Preferred Skills field")
    } else {
      return preferred.append({ id: newId, value: "" });
    }
  }

  return (
    <TooltipProvider>
      <Card className="border p-0 border-indigo-200/50 dark:border-indigo-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/20 backdrop-blur-sm overflow-hidden">
        {/* Header with gradient background */}
        <CardHeader className="pb-4 pt-4 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 text-white rounded-t-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Brain className="w-4 h-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                  Screening Questions
                  <Badge variant="secondary" className="hidden sm:flex ml-2 bg-white/20 text-white border-0 hover:bg-white/30">
                    {fields.length} {fields.length === 1 ? 'question' : 'questions'}
                  </Badge>
                </CardTitle>
                <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                  Define questions and their importance for AI candidate assessment
                </p>
              </div>
            </div>
            <Target className="h-6 w-6 text-white/70 hidden sm:block" />
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {fields.map((field, i) => {
            const currentWeight = watch(`questions.${i}.weight`) || 0.2;
            const getWeightColor = (weight: number) => {
              if (weight >= 0.35) return "bg-red-500";
              if (weight >= 0.2) return "bg-orange-500";
              return "bg-green-500";
            };

            return (
              <Card key={field.id} className="border border-indigo-100 dark:border-indigo-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                        Q{i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Question #{i + 1}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`${getWeightColor(currentWeight)} text-white border-0 px-2 py-1 text-xs`}
                          >
                            <Scale className="h-3 w-3 mr-1" />
                            Weight: {currentWeight}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(i)}
                      className="border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FileQuestion className="h-4 w-4 text-indigo-500" />
                      Question Text
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        </TooltipTrigger>
                        <TooltipContent>Enter the actual question that will be asked to candidates</TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g., How do you ensure code quality in large projects?"
                        {...register(`questions.${i}.question`)}
                        className="pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
                      />
                      <FileQuestion className="h-5 w-5 text-indigo-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.questions?.[i]?.question && (
                      <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                        {errors.questions?.[i].question.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description (Optional)
                    </Label>
                    <Textarea
                      placeholder="Provide additional context or what you're looking for in the answer..."
                      {...register(`questions.${i}.description`)}
                      className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg min-h-[100px] resize-y text-base p-4"
                    />
                  </div>

                  {/* Mapped Competencies */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-500" />
                      Mapped Competencies
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        </TooltipTrigger>
                        <TooltipContent>Select which competencies this question assesses</TooltipContent>
                      </Tooltip>
                    </Label>
                    <CompetencyMultiSelect
                      form={form}
                      value={watch(`questions.${i}.mapped_competencies`) || []}
                      onChange={(val) => form.setValue(`questions.${i}.mapped_competencies`, val)}
                    />
                    {errors.questions?.[i]?.mapped_competencies && (
                      <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                        {errors.questions?.[i].mapped_competencies.message}
                      </p>
                    )}
                  </div>

                  {/* Question Weight */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-indigo-500" />
                      Question Weight
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        </TooltipTrigger>
                        <TooltipContent>How important is this question for the overall AI assessment?</TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name={`questions.${i}.weight`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(val) => field.onChange(parseFloat(val))}
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base">
                            <SelectValue placeholder="Select weight importance" />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border-gray-200 dark:border-gray-700">
                            <SelectItem value="0.15" className="flex items-center gap-3 py-3 text-base hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <div>
                                <div className="font-medium">Low (Supporting)</div>
                                <div className="text-xs text-gray-500">Minor influence – 0.15</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="0.2" className="flex items-center gap-3 py-3 text-base hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer transition-colors">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <div>
                                <div className="font-medium">Medium (Moderate)</div>
                                <div className="text-xs text-gray-500">Standard importance – 0.20</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="0.35" className="flex items-center gap-3 py-3 text-base hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <div>
                                <div className="font-medium">High (Important)</div>
                                <div className="text-xs text-gray-500">Strong influence – 0.35</div>
                              </div>
                            </SelectItem>
                            <SelectItem value="0.5" className="flex items-center gap-3 py-3 text-base hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors">
                              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                              <div>
                                <div className="font-medium">Very High (Critical)</div>
                                <div className="text-xs text-gray-500">Maximum impact – 0.50</div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                      currentWeight >= 0.35 ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300" :
                        currentWeight >= 0.2 ? "bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300" :
                          "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    }`}>
                      {{
                        0.15: "💡 Low Impact — Minor influence on overall AI score. Suitable for general or optional questions.",
                        0.2: "⚖️ Medium Impact — Standard importance. Good for behavioral or standard competency questions.",
                        0.35: "🎯 High Impact — Strong influence on candidate evaluation. Recommended for key job competencies.",
                        0.5: "🚀 Critical Impact — Maximum weight. Use for essential must-have qualifications or deal-breaker questions.",
                      }[currentWeight] || "Select a weight level to see its impact on candidate assessment."}
                    </div>
                    {errors.questions?.[i]?.weight && (
                      <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        {errors.questions?.[i].weight.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10">
              <Brain className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No screening questions added yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Add AI-powered screening questions to automatically assess candidate competencies and qualifications.
              </p>
            </div>
          )}

          {/* Add Question Button */}
          <Button
            type="button"
            onClick={() => append({
              id: null,
              question: "",
              description: "",
              weight: 0.2,
              mapped_competencies: []
            })}
            variant="outline"
            className="w-full border-dashed border-2 border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-200 group py-6 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Plus className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-700 dark:text-gray-300">
                  Add Screening Question
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Click to add a new AI-assessment question
                </div>
              </div>
            </div>
          </Button>

          {/* AI Assessment Tip */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-1">
                  AI Assessment Strategy
                </h4>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Well-designed screening questions with proper weight distribution help the AI system
                  accurately evaluate candidates and identify the best fits for your role.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
