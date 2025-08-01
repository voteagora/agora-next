import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
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
  tooltip?: string;
  required?: boolean;
  customInput?: React.ReactNode;
};

function NumberInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  tooltip,
  placeholder,
  description,
  customInput,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & NumberInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger type="button" className="flex flex-row space-x-1">
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
                <TooltipContent className="text-sm max-w-[200px] text-secondary">
                  {tooltip}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <FormControl>
            {customInput ? (
              customInput
            ) : (
              <div className="relative">
                <input
                  type="number"
                  className={`border bg-wash border-line placeholder:text-tertiary p-2 rounded-lg w-full text-primary`}
                  {...field}
                  placeholder={placeholder}
                  onWheel={(e) => e.currentTarget.blur()}
                  min={0}
                />
              </div>
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default NumberInput;
