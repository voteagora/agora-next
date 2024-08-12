import { useState, useEffect, Fragment } from "react";
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
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

type SwitchInputProps = {
  label: string;
  options: { label: string; value: string }[];
  description?: string;
  required?: boolean;
  emptyCopy?: string;
  tooltip?: string;
};

function SelectInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  description,
  options,
  emptyCopy,
  tooltip,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> & SwitchInputProps) {
  const [value, setValue] = useState<string>();
  const { getValues, watch } = useFormContext();

  // make sure default value is set
  const diff = watch(name);
  useEffect(() => {
    setValue(getValues(name));
  }, [getValues, name, diff]);

  const getOptionByValue = (value: string | undefined) => {
    return options.find((option) => option.value === value);
  };

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
            {options.length > 0 ? (
              <div className="">
                <Listbox
                  value={value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue(v);
                  }}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative cursor-default py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 border bg-wash border-line placeholder:text-tertiary p-2 rounded-lg w-full">
                      <span className="block truncate">
                        {getOptionByValue(value)?.label}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                        {options.map((option, idx) => (
                          <Listbox.Option
                            key={`option-${idx}`}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-wash text-primary"
                                  : "text-tertiary"
                              }`
                            }
                            value={option.value}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {option.label}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-brandPrimary">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            ) : (
              <span className="block py-2 pl-3 pr-10 text-left border bg-agora-stone-50 border-agora-stone-100 placeholder:text-agora-stone-500 text-tertiary p-2 rounded-lg w-full">
                {emptyCopy}
              </span>
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SelectInput;
