import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
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
  tooltip?: string;
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
  tooltip,
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
            <div className="relative">
              <input
                value={value}
                defaultValue={value}
                onChange={(e: any) => {
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
