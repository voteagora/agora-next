import { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { RadioGroup } from "@headlessui/react";

type RadioGroupInputProps = {
  name: string;
  control: any;
  options: { label: string; value: string; icon?: string }[];
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const RadioGroupInput = ({ options, name }: RadioGroupInputProps) => {
  const [value, setValue] = useState("");
  const { control, getValues } = useFormContext();

  // make sure default value is set
  useEffect(() => {
    setValue(getValues(name));
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <RadioGroup
          value={value}
          name={name}
          onChange={(value: any) => {
            setValue(value);
            onChange(value);
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
                  classNames(
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
                  {option.icon && <img src={option.icon} className="h-5 w-5" />}
                  <span>{option.label}</span>
                </RadioGroup.Label>
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
      )}
    />
  );
};

export default RadioGroupInput;
