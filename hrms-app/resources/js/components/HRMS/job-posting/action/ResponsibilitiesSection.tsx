import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export function ResponsibilitiesSection({ form }: any) {
  const { control, register, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "responsibilities",
  });

  const handleResponsibilities = () => {
    const nextIndex = fields.length + 1;
    const newId = `responsibilities_id_${nextIndex}`;
    append({ id: newId, value: "" });
  };

  return (
    <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow">
      <Label>Responsibilities <span className="text-red-500">*</span></Label>
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2">
          <div className="flex flex-col w-full">
            <Input {...register(`responsibilities.${i}.value`)} placeholder='e.g "Manage and organize administrative documents related to learning activities."' />
            {errors.responsibilities?.[i]?.value && (
              <span className="mt-2 text-sm text-red-500">{errors.responsibilities[i].value.message}</span>
            )}
          </div>
          <Button type="button" variant="destructive" onClick={() => remove(i)}>
            <Trash2/>
          </Button>
        </div>
      ))}
      <Button type="button" onClick={handleResponsibilities}>+ Add Responsibility</Button>
    </div>
  );
}
