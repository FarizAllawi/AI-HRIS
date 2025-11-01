import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export function QualificationSection({ form }: any) {
  const { control, register, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "qualifications",
  });

  const handleAddQualification = () => {
    const nextIndex = fields.length + 1;
    const newId = `qualifications_id_${nextIndex}`;
    append({ id: newId, value: "" });
  };

  return (
    <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow">
      <Label>Qualification <span className="text-red-500">*</span></Label>
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2">
          <div className="flex flex-col w-full">
            <Input {...register(`qualifications.${i}.value`)} placeholder='e.g "Minimum of an associate degree (D3) in Office Administration."' />
            {errors.qualifications?.[i]?.value && (
              <span className="mt-2 text-sm text-red-500">{errors.qualifications[i].value.message}</span>
            )}
          </div>
          <Button type="button" variant="destructive" onClick={() => remove(i)}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" onClick={handleAddQualification}>+ Add Qualification</Button>
    </div>
  );
}
