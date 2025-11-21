import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Gift, Heart, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export function BenefitsSection({ form }: any) {
  const { control, register, watch, formState: { errors } } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "benefits",
  });

  const handleBenefits = () => {
    const nextIndex = fields.length + 1;
    const newId = `benefits_${nextIndex}`;

    const currentBenefitValue = watch(`benefits.${fields.length - 1}.value`);

    if (fields.length !== 0 && (!currentBenefitValue || currentBenefitValue.trim() === '')) {
      toast.warning("Please fill the Benefits")
    } else {
      append({ id: newId, value: "" });
    }
  };

  // Function to handle quick add benefits with the same logic
  const handleQuickAddBenefit = (benefit: string) => {
    const currentBenefitValue = watch(`benefits.${fields.length - 1}.value`);

    if (!currentBenefitValue || currentBenefitValue.trim() === '') {
      // If first benefit is empty, insert at index 1
      return update(fields.length - 1, { id: `benefits_${fields.length - 1}`, value: benefit });
    } else {
      const nextIndex = fields.length + 1;
      const newId = `benefits_${nextIndex}`;
      return append({ id: newId, value: benefit });
    }
  };

  const popularBenefits = [
    "Health Insurance", "Dental Coverage", "Flexible Hours", "Remote Work",
    "Paid Time Off", "Professional Development", "Retirement Plan",
    "Stock Options", "Gym Membership", "Meal Allowance", "Bonus System",
    "Parental Leave", "Mental Health Support", "Learning Budget"
  ];

  return (
    <Card className="border p-0 border-green-200/50 dark:border-green-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-900 dark:to-green-950/20 backdrop-blur-sm overflow-hidden">
      {/* Header with gradient background */}
      <CardHeader className="pb-4 pt-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 text-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-4 h-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-xl font-bold flex items-center gap-2">
                Employee Benefits
                <Badge variant="secondary" className="hidden sm:flex ml-2 bg-white/20 text-white border-0 hover:bg-white/30">
                  {fields.length} {fields.length === 1 ? 'item' : 'items'}
                </Badge>
              </CardTitle>
              <p className="text-xs sm:text-sm text-green-100 mt-1">
                Highlight the perks and benefits that make your company stand out
              </p>
            </div>
          </div>
          <Sparkles className="h-6 w-6 text-white/70 hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Benefits List */}
        <div className="space-y-4">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="flex gap-3 group transition-all duration-200 hover:bg-green-50/50 dark:hover:bg-green-900/10 sm:p-4 rounded-xl border border-transparent hover:border-green-200 dark:hover:border-green-800"
            >
              {/* Benefit Number and Indicator */}
              <div className="hidden sm:flex flex-col items-center pt-1">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  {i + 1}
                </div>
                <div className="w-0.5 h-full bg-gradient-to-b from-green-500 to-emerald-500 mt-2 opacity-60"></div>
              </div>

              {/* Input Field */}
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  Benefit {i + 1}
                  {i === 0 && <span className="text-xs text-green-600 dark:text-green-400 font-normal">(Most attractive)</span>}
                </Label>
                <div className="relative">
                  <Input
                    {...register(`benefits.${i}.value`)}
                    placeholder='e.g., "Comprehensive health insurance with dental and vision coverage"'
                    className="sm:pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
                  />
                  <Gift className="hidden sm:flex h-5 w-5 text-green-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {errors.benefits?.[i]?.value && (
                  <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                    {errors.benefits[i].value.message}
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
            <div className="text-center py-8 px-4 border-2 border-dashed border-green-200 dark:border-green-800 rounded-2xl bg-green-50/30 dark:bg-green-950/10">
              <Gift className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No benefits added yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Add attractive benefits and perks to make this position more appealing to candidates.
              </p>
            </div>
          )}
        </div>

        {/* Add Benefit Button */}
        <Button
          type="button"
          onClick={handleBenefits}
          variant="outline"
          className="w-full border-dashed border-2 border-green-300 dark:border-green-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 group py-6 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Plus className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-700 dark:text-gray-300">
                Add Custom Benefit
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Click to add a unique benefit
              </div>
            </div>
          </div>
        </Button>

        {/* Quick Add Benefits Suggestions */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm mb-1">
                Quick Add Benefits
              </h4>
              <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                Click on any benefit below to add it instantly:
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularBenefits.map((benefit) => (
              <button
                key={benefit}
                type="button"
                className="text-xs bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:hover:bg-emerald-600 transition-all duration-200 hover:scale-105 shadow-sm"
                onClick={() => handleQuickAddBenefit(benefit)}
              >
                {benefit}
              </button>
            ))}
          </div>
        </div>

        {/* Benefits Impact Tip */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                Benefits Impact
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Comprehensive benefits packages can increase application rates by up to 40% and improve employee retention.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
