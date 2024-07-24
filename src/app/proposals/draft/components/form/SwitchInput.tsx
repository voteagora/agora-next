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

type TextInputProps = {
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
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & TextInputProps) {
  const [value, setValue] = useState("");
  const { getValues } = useFormContext();

  // make sure default value is set
  useEffect(() => {
    setValue(getValues(name));
  }, [getValues, name]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel
            className="text-xs font-semibold text-agora-stone-700"
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
