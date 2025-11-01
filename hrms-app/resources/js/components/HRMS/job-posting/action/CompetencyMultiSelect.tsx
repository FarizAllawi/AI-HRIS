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
import { Check, ChevronsUpDown } from "lucide-react";
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

  const selectedOptions = competencyOptions.filter((opt) =>
    value.includes(opt.id)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "requirement":
        return "py-1 px-2 rounded-md bg-blue-100 text-blue-700 capitalize";
      case "responsibility":
        return "py-1 px-2 rounded-md bg-green-100 text-green-700 capitalize";
      case "qualification":
        return "py-1 px-2 rounded-md bg-purple-100 text-purple-700 capitalize";
      case "required_skill":
        return "py-1 px-2 rounded-md bg-orange-100 text-orange-700 capitalize";
      case "preferred_skill":
        return "py-1 px-2 rounded-md bg-pink-100 text-pink-700 capitalize";
      default:
        return "py-1 px-2 rounded-md bg-gray-100 text-gray-700 capitalize";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-h-[120px] justify-between text-left"
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedOptions.map((opt) => (
                <Badge
                  key={opt.id}
                  className={cn(
                    "text-xs font-medium border-none",
                    getTypeColor(opt.type)
                  )}
                >
                  [{opt.type}] {opt.label}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 text-sm">
              Select one or more competencies
            </span>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] max-h-[300px] overflow-y-auto p-0">
        <Command>
          <CommandInput placeholder="Search competencies..." />
          <CommandEmpty>No competencies found.</CommandEmpty>
          <CommandGroup>
            {competencyOptions.map((option) => (
              <CommandItem
                key={option.id}
                onSelect={() => handleSelect(option.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value.includes(option.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span>
                    <span
                      className={cn(
                        "font-medium",
                        getTypeColor(option.type)
                      )}
                    >
                      {option.type.replace("_", " ")}
                    </span>{" "}
                    {option.label}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
