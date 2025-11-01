import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export function SkillsSection({ form }: any) {
  const { control, register, formState: { errors } } = form;
  const required = useFieldArray({ control, name: "required_skills" });
  const preferred = useFieldArray({ control, name: "preferred_skills" });

  const handleRequiredSkills = () => {
    const nextIndex = required.fields.length + 1;
    const newId = `required_skills_id_${nextIndex}`;
    required.append({ id: newId, value: "" });
  };

  const handlePrefferedSkills = () => {
    const nextIndex = preferred.fields.length + 1;
    const newId = `prefered_skills_id_${nextIndex}`;
    preferred.append({ id: newId, value: "" });
  };

  return (
    <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow">
      <h2 className="text-lg font-semibold mb-2">Skills</h2>

      <div className="flex flex-col space-y-4">
        <Label>Required Skills</Label>
        {required.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex flex-col w-full">
              <Input {...register(`required_skills.${i}.value`)} placeholder='e.g "Proficiency in Microsoft Word, Excel, and PowerPoint."' />
              {errors.required_skills?.[i]?.value && (
                <span className="mt-2 text-sm text-red-500">{errors.required_skills[i].value.message}</span>
              )}
            </div>
            <Button type="button" variant="destructive" onClick={handleRequiredSkills}>
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => required.append({ value: "" })}>+ Add Required Skill</Button>
      </div>

      <div className="flex flex-col space-y-4">
        <Label>Preferred Skills</Label>
        {preferred.fields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <div className="flex flex-col w-full">
              <Input {...register(`preferred_skills.${i}.value`)} placeholder='e.g "Experience using Learning Management Systems (LMS) such as Moodle or Google Classroom."'/>
              {errors.preferred_skills?.[i]?.value && (
                <span className="mt-2 text-sm text-red-500">{errors.preferred_skills[i].value.message}</span>
              )}
            </div>
            <Button type="button" variant="destructive" onClick={handlePrefferedSkills}>
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={handlePrefferedSkills}>+ Add Preferred Skill</Button>
      </div>
    </div>
  );
}
