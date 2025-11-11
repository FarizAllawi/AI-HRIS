import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, GraduationCap, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function QualificationSection({ form }: any) {
  const { control, register, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  });

  const handleAddQualification = () => {
    const nextIndex = fields.length + 1;
    const newId = `qualifications_id_${nextIndex}`;
    append({ id: newId, value: "" });
  };

  return (
    <Card className="border p-0 border-purple-200/50 dark:border-purple-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 backdrop-blur-sm overflow-hidden">
      {/* Header with gradient background */}
      <CardHeader className="pb-4 pt-4 bg-gradient-to-r from-purple-500 to-violet-600 dark:from-purple-700 dark:to-violet-800 text-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="w-4 h-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                Qualifications & Education
                <Badge variant="secondary" className="hidden sm:flex ml-2 bg-white/20 text-white border-0 hover:bg-white/30">
                  {fields.length} {fields.length === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
              <p className="text-xs sm:text-sm text-purple-100 mt-1">
                List required educational background, degrees, and qualifications
              </p>
            </div>
          </div>
          <Award className="h-6 w-6 text-white/70 hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Qualifications List */}
        <div className="space-y-4">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="flex gap-3 group transition-all duration-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 sm:p-4 rounded-xl border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
            >
              {/* Qualification Number and Indicator */}
              <div className="hidden sm:flex flex-col items-center pt-1">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  {i + 1}
                </div>
                <div className="w-0.5 h-full bg-gradient-to-b from-purple-500 to-violet-500 mt-2 opacity-60"></div>
              </div>

              {/* Input Field */}
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  Qualification {i + 1}
                  {i === 0 && <span className="text-xs text-purple-600 dark:text-purple-400 font-normal">(Minimum requirement)</span>}
                </Label>
                <div className="relative">
                  <Input
                    {...register(`qualifications.${i}.value`)}
                    placeholder='e.g., "Minimum of an associate degree (D3) in Office Administration or related field"'
                    className="sm:pl-10 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
                  />
                  <BookOpen className="hidden sm:flex h-5 w-5 text-purple-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.qualifications?.[i]?.value && (
                  <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                    {errors.qualifications[i].value.message}
                  </p>
                )}
              </div>

              {/* Delete Button - Always visible but with hover effect */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(i)}
                className="h-10 w-10 mt-8 border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Empty State */}
          {fields.length === 0 && (
            <div className="text-center py-8 px-4 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10">
              <GraduationCap className="h-12 w-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No qualifications added yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Add qualifications needed for this position.
              </p>
            </div>
          )}
        </div>

        {/* Add Qualification Button */}
        <Button
          type="button"
          onClick={handleAddQualification}
          variant="outline"
          className="w-full border-dashed border-2 border-purple-300 dark:border-purple-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-200 group py-6 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Plus className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-700 dark:text-gray-300">
                Add Qualification
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Click to add another qualification
              </div>
            </div>
          </div>
        </Button>

        {/* Quick Tips */}
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-violet-900 dark:text-violet-100 text-sm mb-1">
                Qualification Guidelines
              </h4>
              <p className="text-violet-700 dark:text-violet-300 text-sm">
                Include degree requirements, certifications, licenses, and specific educational backgrounds.
                Specify if equivalent experience is acceptable.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
