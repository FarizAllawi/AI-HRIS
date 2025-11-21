import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X, Target, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetencyOption {
  id: string;
  label: string;
  type: string;
}

export function CompetencyMultiSelect({
                                        form,
                                        value = [],
                                        onChange,
                                      }: {
  form: any;
  value?: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);

  // Combine data from form values
  const requirements = form.watch("requirements") || [];
  const responsibilities = form.watch("responsibilities") || [];
  const qualifications = form.watch("qualifications") || [];
  const required_skills = form.watch("required_skills") || [];
  const preferred_skills = form.watch("preferred_skills") || [];

  // Merge all competency sources into a single list
  const competencyOptions: CompetencyOption[] = [
    ...requirements.map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "requirement",
    })),
    ...responsibilities.map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "responsibility",
    })),
    ...qualifications.map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "qualification",
    })),
    ...(required_skills || []).map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "required_skill",
    })),
    ...(preferred_skills || []).map((r: any) => ({
      id: r.id,
      label: r.value,
      type: "preferred_skill",
    })),
  ];

  const handleSelect = (id: string) => {
    const newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id];
    onChange(newValue);
  };

  const removeCompetency = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== id);
    onChange(newValue);
  };

  const selectedOptions = competencyOptions.filter((opt) =>
    value.includes(opt.id)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "requirement":
        return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800";
      case "responsibility":
        return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800";
      case "qualification":
        return "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800";
      case "required_skill":
        return "bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-800";
      case "preferred_skill":
        return "bg-pink-500/10 text-pink-700 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-800";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    const baseClass = "w-3 h-3 rounded-full flex-shrink-0";
    switch (type) {
      case "requirement": return <div className={`${baseClass} bg-blue-500`} />;
      case "responsibility": return <div className={`${baseClass} bg-green-500`} />;
      case "qualification": return <div className={`${baseClass} bg-purple-500`} />;
      case "required_skill": return <div className={`${baseClass} bg-orange-500`} />;
      case "preferred_skill": return <div className={`${baseClass} bg-pink-500`} />;
      default: return <div className={`${baseClass} bg-gray-500`} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "requirement": return "Requirement";
      case "responsibility": return "Responsibility";
      case "qualification": return "Qualification";
      case "required_skill": return "Required Skill";
      case "preferred_skill": return "Preferred Skill";
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-auto justify-between text-left hover:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl p-4 group"
          >
            <div className="flex flex-col items-start gap-3 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Layers className="h-4 w-4 text-indigo-500" />
                {selectedOptions.length > 0 ? (
                  <span className="font-medium text-wrap text-gray-700 dark:text-gray-300">
                    Mapped Competencies ({selectedOptions.length})
                  </span>
                ) : (
                  <span className="text-wrap">Select competencies to map to this question...</span>
                )}
              </div>

              {selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2 w-full h-auto">
                  {selectedOptions.map((opt) => (
                    <Badge
                      key={opt.id}
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium border-1.5 flex items-center gap-2 group-hover:bg-opacity-80 transition-all px-3 py-2 rounded-lg",
                        getTypeColor(opt.type)
                      )}
                    >
                      {getTypeIcon(opt.type)}
                      <span className="max-w-[200px] truncate">
                        {opt.label}
                      </span>
                      <X
                        className="h-3 w-3 ml-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 hover:scale-110"
                        onClick={(e) => removeCompetency(opt.id, e)}
                      />
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                  <Target className="h-4 w-4" />
                  No competencies selected yet
                </div>
              )}
            </div>
            <ChevronsUpDown className="sm:ml-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl" align="start">
          <Command className="rounded-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <CommandInput
                placeholder="Search competencies..."
                className="h-10 border-0 focus:ring-0 bg-transparent placeholder:text-gray-500"
              />
            </div>

            <CommandEmpty className="py-8 text-center">
              <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                <Layers className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium">No competencies found</div>
                  <div className="mt-1">Add some in the sections above first</div>
                </div>
              </div>
            </CommandEmpty>

            <CommandGroup className="max-h-[300px] overflow-y-auto p-2">
              {competencyOptions.map((option) => {
                const isSelected = value.includes(option.id);
                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => handleSelect(option.id)}
                    className={cn(
                      "flex items-center justify-between py-3 px-4 cursor-pointer rounded-lg transition-all duration-200 m-1",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-indigo-500 border-indigo-500 text-white"
                          : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      )}>
                        <Check className={cn("h-3 w-3", isSelected ? "opacity-100" : "opacity-0")} />
                      </div>

                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getTypeIcon(option.type)}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-sm font-medium truncate",
                            isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700 dark:text-gray-300"
                          )}>
                            {option.label}
                          </div>
                          <div className={cn(
                            "text-xs mt-0.5 flex items-center gap-1",
                            isSelected ? "text-indigo-500" : "text-gray-500 dark:text-gray-400"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              option.type === "requirement" ? "bg-blue-500" :
                                option.type === "responsibility" ? "bg-green-500" :
                                  option.type === "qualification" ? "bg-purple-500" :
                                    option.type === "required_skill" ? "bg-orange-500" :
                                      "bg-pink-500"
                            )} />
                            {getTypeLabel(option.type)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex-shrink-0 ml-2">
                        <Check className="h-4 w-4 text-indigo-500" />
                      </div>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {/* Footer with count */}
            {competencyOptions.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                  <span>{competencyOptions.length} competencies available</span>
                  <span>{value.length} selected</span>
                </div>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selection Summary */}
      {selectedOptions.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
            <Target className="h-4 w-4" />
            <span className="font-medium">Competency Mapping Summary</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {Array.from(new Set(selectedOptions.map(opt => opt.type))).map(type => {
              const count = selectedOptions.filter(opt => opt.type === type).length;
              return (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    "text-xs border-1.5",
                    getTypeColor(type)
                  )}
                >
                  {getTypeIcon(type)}
                  {getTypeLabel(type)}: {count}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
