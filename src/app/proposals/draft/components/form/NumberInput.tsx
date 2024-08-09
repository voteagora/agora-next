import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type NumberInputProps = {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

function NumberInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  placeholder,
  description,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & NumberInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className="text-xs font-semibold secondary"
            isRequired={required}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <input
                type="number"
                className={`border bg-wash border-line placeholder:text-tertiary p-2 rounded-lg w-full text-primary`}
                {...field}
                placeholder={placeholder}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default NumberInput;
