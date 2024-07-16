"use client";

import { useState, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import MarkdownPreview from "@uiw/react-markdown-preview";

// example markdown to test with for the developer convenience :)

// # This is a header
// ## This is a subheader
// this is a paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.
// ## This is another subheader
// this is another paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, diam, quisque amet, nunc. Sed euismod, diam, quisque amet, nunc.
// this is list:
// - item 1
// - item 2
// - item 3

type MarkdownTextareaInputProps = {
  name: string;
  placeholder?: string;
};

const MarkdownTextareaInput = ({
  name,
  placeholder,
}: MarkdownTextareaInputProps) => {
  const [value, setValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<"write" | "preview">(
    "write"
  );

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
          <div className="min-h-[215px] w-full border border-gray-eo rounded-t-lg bg-gray-fa">
            <textarea
              className={`py-3 px-4 border-0 placeholder-gray-af w-full bg-gray-fa rounded-t-lg focus:outline-none focus:ring-0 resize-none
                ${selectedMode === "write" ? "visible" : "hidden"}`}
              placeholder={placeholder}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                onChange(e);
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
          <div className="w-full flex flex-row justify-end py-3 gap-x-1 rounded-b-lg border-x border-b border-gray-eo pr-2">
            <button
              type="button"
              className={`py-2 px-3 rounded-full font-medium ${
                selectedMode === "write"
                  ? "bg-gray-fa text-black"
                  : "text-gray-af"
              }`}
              onClick={() => setSelectedMode("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={`py-2 px-3 rounded-full font-medium ${
                selectedMode === "preview"
                  ? "bg-gray-fa text-black"
                  : "text-gray-af"
              }`}
              onClick={() => setSelectedMode("preview")}
            >
              Preview
            </button>
          </div>
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
