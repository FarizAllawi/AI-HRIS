import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export function RequirementsSection({ form }: any) {
  const { control, register, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirements",
  });

  const handleAddRequirement = () => {
    const nextIndex = fields.length + 1;
    const newId = `requirements_id_${nextIndex}`;
    append({ id: newId, value: "" });
  };

  return (
    <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow">
      <Label>Requirements <span className="text-red-500">*</span></Label>
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2">
          <div className="flex flex-col w-full">
            <Input {...register(`requirements.${i}.value`)} placeholder='e.g "Proficient in using  office applications (Microsoft Office, Google Workspace)."' />
            {errors.requirements?.[i]?.value && (
              <span className="mt-2 text-sm text-red-500">{errors.requirements[i].value.message}</span>
            )}
          </div>
          <Button type="button" variant="destructive" onClick={() => remove(i)}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" onClick={handleAddRequirement}>+ Add Requirement</Button>
    </div>
  );
}
