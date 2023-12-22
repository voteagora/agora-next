import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormValues } from "./DelegateStatementForm";
import { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/ui/form";

export default function DelegateStatementInputGroup({
  form,
  name,
  placeholder,
  title,
}: {
  form: UseFormReturn<FormValues>;
  name: "discord" | "twitter" | "email";
  placeholder: string;
  title: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <Label variant="black">
          <h4 className="font-bold text-xs mb-2">{title}</h4>
          <Input
            variant="bgGray100"
            inputSize="md"
            placeholder={placeholder}
            {...field}
          />
        </Label>
      )}
    />
  );
}
