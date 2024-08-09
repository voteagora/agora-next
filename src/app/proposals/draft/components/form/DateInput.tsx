import { useState, useEffect } from "react";
import {
  ControllerProps,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formatDate = (date: Date) => {
  // Get the year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Return the formatted date string
  return `${year}-${month}-${day}`;
};

type DateInputProps = {
  label: string;
  required?: boolean;
  description?: string;
};

function DateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  description,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & DateInputProps) {
  const [value, setValue] = useState("");
  const { getValues } = useFormContext();

  //make sure default value is set
  useEffect(() => {
    const date = getValues(name);
    const formattedDate = formatDate(new Date(date));
    setValue(formattedDate);
  }, []);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className="text-xs font-semibold text-secondary"
            isRequired={required}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <input
                value={value}
                defaultValue={value}
                onChange={(e: any) => {
                  console.log(e.target.value);
                  setValue(e.target.value);
                  field.onChange(e.target.value);
                }}
                type="date"
                className="bg-wash border border-line rounded-lg text-primary placehoder:text-tertiary w-full"
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

export default DateInput;
