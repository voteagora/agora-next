import { useState, useEffect } from "react";
import { Switch } from "@/components/shared/Switch";
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

type SwitchInputProps = {
  label: string;
  options: string[];
  description?: string;
  required?: boolean;
};

function SwitchInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  description,
  options,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & SwitchInputProps) {
  const [value, setValue] = useState("");
  const { getValues, watch } = useFormContext();

  // make sure default value is set
  const diff = watch(name);
  useEffect(() => {
    setValue(getValues(name));
  }, [getValues, name, diff]);

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
            <Switch
              options={options}
              selection={value}
              onSelectionChanged={(value) => {
                field.onChange(value);
                setValue(value);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SwitchInput;
