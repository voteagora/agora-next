"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
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
  tooltip?: string;
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
  tooltip,
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex flex-row space-x-1">
                <FormLabel
                  className="text-xs font-semibold secondary"
                  isRequired={required}
                >
                  {label}
                </FormLabel>
                {!!tooltip && (
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                )}
              </TooltipTrigger>
              {!!tooltip && (
                <TooltipContent className="text-sm max-w-[200px]">
                  {tooltip}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
                          ? "ring-2 ring-primary bg-wash"
                          : "bg-white ring-1 ring-line",
                        "ring-inset flex items-center justify-center rounded-md py-3 px-4 sm:flex-1 cursor-pointer focus:outline-none text-primary hover:bg-wash text-base sm:text-[16px]"
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
