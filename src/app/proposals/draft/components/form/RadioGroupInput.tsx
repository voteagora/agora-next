import { useState, useEffect } from "react";
import { RadioGroup } from "@headlessui/react";
import { cn } from "@/lib/utils";
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

type RadioGroupInputProps = {
  label: string;
  options: { label: string; value: string; icon?: string }[];
  description?: string;
  required?: boolean;
};

function RadioGroupInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  description,
  options,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> &
  RadioGroupInputProps) {
  const [value, setValue] = useState("");
  const { getValues } = useFormContext();

  // make sure default value is set
  useEffect(() => {
    setValue(getValues(name));
  }, []);

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
            <RadioGroup
              value={value}
              name={name}
              onChange={(value: any) => {
                setValue(value);
                field.onChange(value);
              }}
            >
              <div
                className={`grid ${
                  // Todo: make this more dynamic
                  options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                } gap-3`}
              >
                {options.map((option) => (
                  <RadioGroup.Option
                    key={option.value}
                    value={option.value.toLowerCase()}
                    className={({ checked }) =>
                      cn(
                        checked
                          ? "ring-2 ring-agora-stone-900 bg-agora-stone-50"
                          : "bg-white ring-1 ring-agora-stone-100",
                        "ring-inset flex items-center justify-center rounded-md py-3 px-4 sm:flex-1 cursor-pointer focus:outline-none text-agora-stone-900 hover:bg-gray-50 text-base sm:text-[16px]"
                      )
                    }
                  >
                    <RadioGroup.Label
                      as="span"
                      className="flex flex-row items-center space-x-2"
                    >
                      {option.icon && (
                        <img src={option.icon} className="h-5 w-5" />
                      )}
                      <span>{option.label}</span>
                    </RadioGroup.Label>
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default RadioGroupInput;
