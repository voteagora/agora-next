import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TextInputProps = {
  label: string;
  description?: string;
  placeholder?: string;
  units?: string;
};

function TextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  description,
  units,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & TextInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <input
                type="text"
                className={`border bg-agora-stone-50 border-agora-stone-100 placeholder:text-agora-stone-500 p-2 rounded-lg w-full`}
                {...field}
                placeholder={placeholder}
              />
              {units && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-agora-stone-500">
                  {units}
                </span>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TextInput;
