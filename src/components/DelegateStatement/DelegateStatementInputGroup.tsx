import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import { FormField } from "@/components/ui/form";

export default function DelegateStatementInputGroup({
  form,
  name,
  placeholder,
  title,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
  name: "discord" | "twitter" | "email" | "warpcast";
  placeholder: string;
  title: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <Label variant="black">
          <h4 className="font-semibold text-xs mb-1 text-secondary">{title}</h4>
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
