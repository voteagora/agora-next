import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
export interface FilterOption {
  value: string;
  sort: string;
}

interface FilterListboxProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, FilterOption> | FilterOption[];
  buttonClassName?: string;
  width?: string;
}

export default function FilterListbox({
  value,
  onChange,
  options,
  buttonClassName = "bg-wash",
  width = "w-[176px]",
}: FilterListboxProps) {
  const optionsArray = Array.isArray(options)
    ? options
    : Object.values(options);

  const getCurrentLabel = () => {
    if (Array.isArray(options)) {
      return options.find((opt) => opt.sort === value)?.value;
    }
    return options[value]?.value;
  };

  return (
    <Listbox as="div" value={value} onChange={onChange}>
      {() => (
        <>
          <Listbox.Button
            className={cn(
              `w-full sm:${width} text-sm font-medium border border-line rounded-full py-2 px-4 flex items-center justify-between`,
              buttonClassName
            )}
          >
            <span className="truncate">{getCurrentLabel()}</span>
            <ChevronDown className="h-4 w-4 ml-[6px] shrink-0 text-secondary/30" />
          </Listbox.Button>
          <Listbox.Options className="mt-3 absolute bg-wash border border-line p-2 rounded-2xl flex flex-col gap-1 z-20 w-max">
            {optionsArray.map((option) => (
              <Listbox.Option
                key={option.sort}
                value={option.sort}
                as={Fragment}
              >
                {({ selected }) => (
                  <li
                    className={`cursor-pointer text-base py-2 px-3 rounded-xl font-medium hover:text-primary hover:bg-tertiary/20 ${
                      selected
                        ? "text-primary bg-tertiary/20"
                        : "text-secondary border-transparent"
                    }`}
                  >
                    {option.value}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </>
      )}
    </Listbox>
  );
}
