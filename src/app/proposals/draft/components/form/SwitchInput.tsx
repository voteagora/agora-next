import { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/components/shared/Switch";

type MarkdownTextareaInputProps = {
  name: string;
  options: string[];
};

const MarkdownTextareaInput = ({
  name,
  options,
}: MarkdownTextareaInputProps) => {
  const [value, setValue] = useState("");

  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext();

  // make sure default value is set
  useEffect(() => {
    setValue(getValues(name));
  }, []);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <div className="flex flex-col">
          <Switch
            options={options}
            selection={value}
            onSelectionChanged={(value) => {
              onChange(value);
              setValue(value);
            }}
          />
          {!!errors[name] && (
            <p className="text-red-500 text-sm mb-0 mt-1">
              {/* @ts-ignore */}
              {errors[name].message?.toString()}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default MarkdownTextareaInput;
