import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Briefcase, MapPin, Building, DollarSign } from "lucide-react";

const jobTypes = {
  "full-time": "Full Time",
  "part-time": "Part Time",
  "contract": "Contract",
  "internship": "Internship",
};

export function JobOverviewSection({ form, serverErrors }: any) {
  const { register, control, formState: { errors } } = form;

  return (
    <Card className="border p-0 border-blue-200/50 dark:border-blue-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 backdrop-blur-sm overflow-hidden">
      {/* Header with gradient background */}
      <CardHeader className="pb-4 pt-4  bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white rounded-t-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Briefcase className="w-4 h-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
                Job Overview
                <Badge variant="secondary" className="hidden sm:flex ml-2 bg-white/20 text-white border-0 hover:bg-white/30">
                  Required Fields
                </Badge>
              </CardTitle>
              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Fields marked with <span className="text-white font-bold">*</span> are required
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Job Title */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Job Title <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent>e.g., "Software Engineer"</TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <Input
              {...register("title")}
              required
              className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
              placeholder="Senior Frontend Developer..."
            />
            <Briefcase className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {errors.title && (
            <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            rows={5}
            {...register("description")}
            required
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg min-h-[140px] resize-y text-base p-4"
            placeholder="Describe the role, responsibilities, and what makes this position exciting..."
          />
          {errors.description && (
            <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Job Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Job Type <span className="text-red-500">*</span>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent>The employment type</TooltipContent>
            </Tooltip>
          </Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} defaultValue="full-time">
                <SelectTrigger className="focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 dark:border-gray-700">
                  {Object.entries(jobTypes).map(([key, label]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="flex items-center gap-3 py-3 text-base hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        key === 'full-time' ? 'bg-green-500' :
                          key === 'part-time' ? 'bg-yellow-500' :
                            key === 'contract' ? 'bg-purple-500' : 'bg-blue-500'
                      }`} />
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {(errors.type || serverErrors?.type) && (
            <p className="text-sm text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {errors.type?.message || serverErrors.type.message}
            </p>
          )}
        </div>

        {/* Location and Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</Label>
            <div className="relative">
              <Input
                {...register("location")}
                placeholder="Remote, Jakarta, Bali..."
                className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
              />
              <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Department</Label>
            <div className="relative">
              <Input
                {...register("departments")}
                placeholder="Engineering, Marketing, Design..."
                className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
              />
              <Building className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Salary Range
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent>e.g., "IDR 5.000.000 - 7.000.000"</TooltipContent>
            </Tooltip>
          </Label>
          <div className="relative">
            <Input
              {...register("salary")}
              placeholder="IDR 8.000.000 - 12.000.000"
              className="pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg py-6 text-base"
            />
            <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
