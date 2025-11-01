import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Controller } from "react-hook-form";

  // Define available job types (you can also import from constants)
  const jobTypes = {
    "full-time": "Full Time",
    "part-time": "Part Time",
    "contract": "Contract",
    "internship": "Internship",
  };

export function JobOverviewSection({ form, serverErrors }: any) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-6 rounded-lg border p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Job Overview</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Fields marked with <span className="text-red-500">*</span> are required.
      </p>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input {...register("title")} required />
            {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>e.g., “Software Engineer”.</TooltipContent>
      </Tooltip>
      <div>
        <Label>Description <span className="text-red-500">*</span></Label>
        <Textarea rows={3} {...register("description")} required />
        {errors.description && <span className="text-sm text-red-500">{errors.description.message}</span>}
      </div>
     {/* Job Type */}
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="type">Job Type <span className="text-red-500">*</span></Label>
          </TooltipTrigger>
          <TooltipContent>
            The employment type, e.g., Full Time, Part Time, Contract, or Internship.
          </TooltipContent>
        </Tooltip>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              defaultValue="full-time"
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(jobTypes).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <span className="text-sm text-red-500">{errors.type.message}</span>}
        {serverErrors?.type && <span className="text-sm text-red-500">{serverErrors.type.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Location</Label>
          <Input {...register("location")} />
        </div>
        <div>
          <Label>Department</Label>
          <Input {...register("departments")} />
        </div>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Label>Salary</Label>
            <Input {...register("salary")} />
            {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>e.g., “IDR 5.000.000 - 7.000.000”.</TooltipContent>
      </Tooltip>
    </div>
  );
}
