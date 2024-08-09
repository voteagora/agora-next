"use client";

import { useState, useEffect } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
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

type MarkdownTextareaInputProps = {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
};

function MarkdownTextareaInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  required,
  control,
  name,
  label,
  placeholder,
  description,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> &
  MarkdownTextareaInputProps) {
  const [value, setValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<"write" | "preview">(
    "write"
  );

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
            className="text-xs font-semibold text-secondary"
            isRequired={required}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="flex flex-col">
              <div className="min-h-[215px] w-full border border-line rounded-t-lg bg-wash">
                <textarea
                  className={`py-3 px-4 border-0 placeholder-gray-af w-full bg-wash rounded-t-lg focus:outline-none focus:ring-0 resize-none
                ${selectedMode === "write" ? "visible" : "hidden"}`}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    field.onChange(e);
                  }}
                  rows={8}
                />

                <div>
                  <MarkdownPreview
                    source={value}
                    className={`h-full py-3 px-4 rounded-t-lg max-w-[650px] bg-transparent  ${selectedMode === "write" ? "hidden" : "visible"}`}
                    style={{
                      backgroundColor: "transparent",
                    }}
                    wrapperElement={{
                      "data-color-mode": "light",
                    }}
                  />
                </div>
              </div>
              <div className="w-full flex flex-row justify-end py-3 gap-x-1 rounded-b-lg border-x border-b border-line pr-2">
                <button
                  type="button"
                  className={`py-2 px-3 rounded-full font-medium ${
                    selectedMode === "write"
                      ? "bg-wash text-black"
                      : "text-tertiary"
                  }`}
                  onClick={() => setSelectedMode("write")}
                >
                  Write
                </button>
                <button
                  type="button"
                  className={`py-2 px-3 rounded-full font-medium ${
                    selectedMode === "preview"
                      ? "bg-wash text-black"
                      : "text-tertiary"
                  }`}
                  onClick={() => setSelectedMode("preview")}
                >
                  Preview
                </button>
              </div>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default MarkdownTextareaInput;
