import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";

type TextInputProps = {
  label: string;
  description?: string;
  placeholder?: string;
  units?: string;
  required?: boolean;
  tooltip?: string;
};

function TextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  placeholder,
  description,
  tooltip,
  units,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & TextInputProps) {
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
                type="text"
                className={`border bg-wash border-line placeholder:text-tertiary text-primary p-2 rounded-lg w-full`}
                {...field}
                placeholder={placeholder}
              />
              {units && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary">
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
