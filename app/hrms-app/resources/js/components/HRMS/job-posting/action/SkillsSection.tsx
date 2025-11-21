import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Star, Zap, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

export function SkillsSection({ form }: any) {
  const { control, register, watch, formState: { errors } } = form;
  const required = useFieldArray({ control, name: "required_skills" });
  const preferred = useFieldArray({ control, name: "preferred_skills" });

  const handleRequiredSkills = () => {
    const nextIndex = required.fields.length + 1;
    const newId = `required_skills_${nextIndex}`;
    // Check if first benefit field is empty or undefined
    const currentRequiredSkillValue = watch(`required_skills.${required.fields.length - 1}.value`);

    if (required.fields.length !== 0 && (!currentRequiredSkillValue || currentRequiredSkillValue.trim() === '')) {
      // If first benefit is empty, insert new benefit at index 1 (second position)
      toast.warning("Please fill the first Required Skills")
    } else {
      // Otherwise, append to the end as normal
      return required.append({ id: newId, value: "" });
    }
  };

  const handlePreferredSkills = () => {
    const nextIndex = preferred.fields.length + 1;
    const newId = `preferred_skills_${nextIndex}`;

    const currentPreferredSkillValue = watch(`preferred_skills.${preferred.fields.length - 1}.value`);

    if (preferred.fields.length !== 0 && (!currentPreferredSkillValue || currentPreferredSkillValue.trim() === '')) {
      toast.warning("Please fill the Preferred Skills field")
    } else {
      return preferred.append({ id: newId, value: "" });
    }
  };

  const handleQuickAddRequired = (value: string) => {
    const currentRequiredValue = watch(`required_skills.${required.fields.length - 1}.value`);

    if (!currentRequiredValue || currentRequiredValue.trim() === '') {
      // If first benefit is empty, insert at index 1
      return required.update(required.fields.length - 1, { id: `required_skills_${required.fields.length - 1}`, value: value });
    } else {
      const nextIndex = required.fields.length + 1;
      const newId = `required_skills_${nextIndex}`;
      return required.append({ id: newId, value: value });
    }
  };

  const handleQuickAddPreferred = (value: string) => {
    const currentPreferredValue = watch(`preferred_skills.${preferred.fields.length - 1}.value`);

    if (!currentPreferredValue || currentPreferredValue.trim() === '') {
      // If first benefit is empty, insert at index 1
      return preferred.update(preferred.fields.length - 1, { id: `preferred_skills_${preferred.fields.length - 1}`, value: value });
    } else {
      const nextIndex = preferred.fields.length + 1;
      const newId = `preferred_skills_${nextIndex}`;
      return preferred.append({ id: newId, value: value });
    }
  };

  const popularTechnicalSkills = [
    "JavaScript", "Python", "React", "Node.js", "TypeScript",
    "SQL", "AWS", "Docker", "Git", "REST APIs"
  ];

  const popularSoftSkills = [
    "Communication", "Teamwork", "Problem Solving", "Leadership",
    "Time Management", "Adaptability", "Creativity", "Critical Thinking"
  ];

  return (
    <Card className="border p-0 border-amber-200/50 dark:border-amber-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/20 backdrop-blur-sm overflow-hidden">
      {/* Header with gradient background */}
      <CardHeader className="pb-4 pt-4 bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-700 dark:to-orange-800 text-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Target className="w-4 h-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                Skills & Competencies
                <Badge variant="secondary" className="hidden sm:flex ml-2 bg-white/20 text-white border-0 hover:bg-white/30">
                  {required.fields.length + preferred.fields.length} total
                </Badge>
              </CardTitle>
              <p className="text-sm text-amber-100 mt-1">
                Define must-have and nice-to-have skills for this role
              </p>
            </div>
          </div>
          <Award className="h-6 w-6 text-white/70 hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <Tabs defaultValue="required" className="space-y-6">
          {/* Enhanced Tabs List */}
          <TabsList className="grid w-full grid-cols-2 p-1 h-14 bg-amber-100/50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">

            <TabsTrigger
              value="required"
              className="flex items-center gap-2 py- data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-red-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-red-400 rounded-lg transition-all duration-200"
            >
              <Star className="h-4 w-4" />
              Required
              <Badge variant="secondary" className="ml-1 bg-red-500 text-white dark:bg-red-600 px-1.5 py-0 h-5 text-xs">
                {required.fields.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="preferred"
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-400 rounded-lg transition-all duration-200"
            >
              <Zap className="h-4 w-4" />
              Preferred
              <Badge variant="secondary" className="ml-1 bg-blue-500 text-white dark:bg-blue-600 px-1.5 py-0 h-5 text-xs">
                {preferred.fields.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Required Skills Tab */}
          <TabsContent value="required" className="space-y-6">
            {/* Skills List */}
            <div className="space-y-4">
              {required.fields.map((field, i) => (
                <div
                  key={field.id}
                  className="flex gap-3 group transition-all duration-200 hover:bg-red-50/50 dark:hover:bg-red-900/10 sm:p-4 rounded-xl border border-transparent hover:border-red-200 dark:hover:border-red-800"
                >
                  {/* Skill Number and Indicator */}
                  <div className="hidden sm:flex flex-col items-center pt-1">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                      {i + 1}
                    </div>
                    <div className="w-0.5 h-full bg-gradient-to-b from-red-500 to-orange-500 mt-2 opacity-60"></div>
                  </div>

                  {/* Input Field */}
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      Required Skill {i + 1}
                      {i === 0 && <span className="text-xs text-red-600 dark:text-red-400 font-normal">(Must have)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        {...register(`required_skills.${i}.value`)}
                        placeholder='e.g., "Proficiency in Microsoft Word, Excel, and PowerPoint"'
                        className="sm:pl-10 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
                      />
                      <Target className="hidden sm:flex h-5 w-5 text-red-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.required_skills?.[i]?.value && (
                      <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                        {errors.required_skills[i].value.message}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => required.remove(i)}
                    className="h-10 w-10 mt-8 border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Empty State */}
              {required.fields.length === 0 && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-red-200 dark:border-red-800 rounded-2xl bg-red-50/30 dark:bg-red-950/10">
                  <Target className="h-12 w-12 text-red-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No required skills added
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Add must-have skills that candidates absolutely need for this role.
                  </p>
                </div>
              )}
            </div>

            {/* Add Required Skill Button */}
            <Button
              type="button"
              onClick={handleRequiredSkills}
              variant="outline"
              className="w-full border-dashed border-2 border-red-300 dark:border-red-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group py-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    Add Custom Required Skill
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Click to add required skill
                  </div>
                </div>
              </div>
            </Button>

            {/* Quick Add Technical Skills */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 text-sm mb-1">
                    Quick Add Technical Skills
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    Click to add common technical skills:
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularTechnicalSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="text-xs bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-orange-500 hover:text-white hover:border-orange-500 dark:hover:bg-orange-600 transition-all duration-200 hover:scale-105 shadow-sm"
                    onClick={() => handleQuickAddRequired(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

          </TabsContent>

          {/* Preferred Skills Tab */}
          <TabsContent value="preferred" className="space-y-6">
            {/* Skills List */}
            <div className="space-y-4">
              {preferred.fields.map((field, i) => (
                <div
                  key={field.id}
                  className="flex gap-3 group transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 sm:p-4 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  {/* Skill Number and Indicator */}
                  <div className="hidden sm:flex flex-col items-center pt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-lg">
                      {i + 1}
                    </div>
                    <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-cyan-500 mt-2 opacity-60"></div>
                  </div>

                  {/* Input Field */}
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      Preferred Skill {i + 1}
                      {i === 0 && <span className="text-xs text-blue-600 dark:text-blue-400 font-normal">(Nice to have)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        {...register(`preferred_skills.${i}.value`)}
                        placeholder='e.g., "Experience using Learning Management Systems (LMS) such as Moodle or Google Classroom"'
                        className="sm:pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
                      />
                      <Star className="hidden sm:flex h-5 w-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {errors.preferred_skills?.[i]?.value && (
                      <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2">
                        {errors.preferred_skills[i].value.message}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => preferred.remove(i)}
                    className="h-10 w-10 mt-8 border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Empty State */}
              {preferred.fields.length === 0 && (
                <div className="text-center py-8 px-4 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl bg-blue-50/30 dark:bg-blue-950/10">
                  <Star className="h-12 w-12 text-blue-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No preferred skills added
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Add bonus skills that would make candidates stand out.
                  </p>
                </div>
              )}
            </div>


            {/* Add Preferred Skill Button */}
            <Button
              type="button"
              onClick={handlePreferredSkills}
              variant="outline"
              className="w-full border-dashed border-2 border-blue-300 dark:border-blue-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 group py-6 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 text-white rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    Add Custom Preferred Skill
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Click to add a preferred skill
                  </div>
                </div>
              </div>
            </Button>

            {/* Quick Add Soft Skills */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <Award className="h-5 w-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 text-sm mb-1">
                    Quick Add Soft Skills
                  </h4>
                  <p className="text-cyan-700 dark:text-cyan-300 text-sm">
                    Click to add common soft skills:
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSoftSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    className="text-xs bg-white dark:bg-gray-800 border border-cyan-200 dark:border-cyan-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-cyan-500 hover:text-white hover:border-cyan-500 dark:hover:bg-cyan-600 transition-all duration-200 hover:scale-105 shadow-sm"
                    onClick={() => handleQuickAddPreferred(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
