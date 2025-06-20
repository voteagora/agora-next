import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { Checkbox } from "@/components/ui/checkbox";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type CheckboxInputProps = {
  label: string;
  description?: string;
  required?: boolean;
  tooltip?: string;
};

function CheckboxInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  tooltip,
  description,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & CheckboxInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="flex flex-col">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex flex-row space-x-1">
                    <FormLabel
                      className="text-xs font-semibold text-secondary cursor-pointer"
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
              {description && <FormDescription>{description}</FormDescription>}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default CheckboxInput;
