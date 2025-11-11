import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, FileText, ListChecks, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export function RequirementsSection({ form }: any) {
  const { control, register, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirements",
  });

  const handleAddRequirement = () => {
    const nextIndex = fields.length + 1;
    const newId = `requirements_${nextIndex}`;

    const currentRequirementsValue = watch(`requirements.${fields.length-1}.value`);
    if (fields.length !== 0 && (!currentRequirementsValue || currentRequirementsValue.trim() === '')) {
      toast.warning("Please fill the Requirements field")
    } else {
      return append({ id: newId, value: "" });
    }
  };

  return (
    <Card className="p-0 border border-orange-200/50 dark:border-orange-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20 backdrop-blur-sm overflow-hidden">
      {/* Header with gradient background */}
      <CardHeader className="pb-4 pt-4 bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-700 dark:to-amber-800 text-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ListChecks className="w-4 h-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-xl font-bold flex items-center gap-2">
                Job Requirements
                <Badge variant="secondary" className="hidden sm:flex ml-2 bg-white/20 text-white border-0 hover:bg-white/30">
                  {fields.length} {fields.length === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
              <p className="text-xs sm:text-sm text-orange-100 mt-1">
                List the essential requirements and qualifications for this position
              </p>
            </div>
          </div>
          <Sparkles className="h-6 w-6 text-white/70 hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Requirements List */}
        <div className="space-y-4">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="flex gap-3 group transition-all duration-200 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 sm:p-4 rounded-xl border border-transparent hover:border-orange-200 dark:hover:border-orange-800"
            >
              {/* Requirement Number and Indicator */}
              <div className="hidden sm:flex flex-col items-center pt-1">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="w-0.5 h-full bg-gradient-to-b from-orange-500 to-amber-500 mt-2 opacity-60"></div>
              </div>

              {/* Input Field */}
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  Requirement {i + 1}
                  {i === 0 && <span className="text-xs text-orange-600 dark:text-orange-400 font-normal">(Most important)</span>}
                </Label>
                <div className="relative">
                  <Input
                    {...register(`requirements.${i}.value`)}
                    placeholder='e.g., "Proficient in using office applications (Microsoft Office, Google Workspace)"'
                    className="sm:pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
                  />
                  <FileText className="hidden sm:flex h-5 w-5 text-orange-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.requirements?.[i]?.value && (
                  <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                    {errors.requirements[i].value.message}
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
            <div className="text-center py-8 px-4 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-2xl bg-orange-50/30 dark:bg-orange-950/10">
              <ListChecks className="h-12 w-12 text-orange-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No requirements added yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Start by adding the key requirement needed for this position.
              </p>
            </div>
          )}
        </div>

        {/* Add Requirement Button */}
        <Button
          type="button"
          onClick={handleAddRequirement}
          variant="outline"
          className="w-full border-dashed border-2 border-orange-300 dark:border-orange-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 group py-6 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Plus className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-700 dark:text-gray-300">
                Add Requirement
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Click to add requirement
              </div>
            </div>
          </div>
        </Button>

        {/* Quick Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                Pro Tip
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                List requirements in order of importance. Start with must-have qualifications and follow with nice-to-have skills.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
