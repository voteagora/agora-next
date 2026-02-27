"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useRef, useCallback } from "react";
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
import Markdown from "@/components/shared/Markdown/Markdown";

type MarkdownTextareaInputProps = {
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
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
  tooltip,
  description,
  disabled,
  onImageUpload,
}: Omit<ControllerProps<TFieldValues, TName>, "render"> &
  MarkdownTextareaInputProps) {
  const [value, setValue] = useState("");
  const [selectedMode, setSelectedMode] = useState<"write" | "preview">(
    "write"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef<(v: string) => void>(() => {});

  const { getValues } = useFormContext();

  // make sure default value is set
  useEffect(() => {
    setValue(getValues(name));
  }, []);

  const insertAtCursor = useCallback(
    (toInsert: string) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const next = before + toInsert + after;
      setValue(next);
      onChangeRef.current(next);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + toInsert.length;
        el.setSelectionRange(pos, pos);
      });
    },
    [value]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      if (!onImageUpload) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const file = Array.from(items)
        .find((i) => i.type.startsWith("image/"))
        ?.getAsFile();
      if (!file) return;
      e.preventDefault();
      try {
        const url = await onImageUpload(file);
        insertAtCursor(`![image](${url})`);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    },
    [onImageUpload, insertAtCursor]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      if (!onImageUpload) return;
      const file = e.dataTransfer?.files[0];
      if (!file?.type.startsWith("image/")) return;
      e.preventDefault();
      try {
        const url = await onImageUpload(file);
        insertAtCursor(`![image](${url})`);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    },
    [onImageUpload, insertAtCursor]
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        onChangeRef.current = (v) =>
          field.onChange({
            target: { value: v },
          } as React.ChangeEvent<HTMLTextAreaElement>);
        return (
          <FormItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1">
                  <FormLabel
                    className="text-xs font-semibold text-secondary"
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
              <div className="flex flex-col">
                <div className="min-h-[215px] w-full border border-line rounded-t-lg bg-wash text-primary">
                  <textarea
                    ref={textareaRef}
                    name="proposalDescription"
                    className={`py-3 px-4 border-0 placeholder-gray-af w-full bg-wash rounded-t-lg focus:outline-none focus:ring-0 resize-none
                ${selectedMode === "write" ? "visible" : "hidden"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      field.onChange(e);
                    }}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    rows={8}
                    disabled={disabled}
                  />

                  <div>
                    <div
                      className={`h-full py-3 px-4 rounded-t-lg max-w-full bg-transparent prose ${selectedMode === "write" ? "hidden" : "visible"}`}
                    >
                      <Markdown content={value} />
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row justify-end py-3 gap-x-1 rounded-b-lg border-x border-b border-line pr-2">
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-full font-medium ${
                      selectedMode === "write"
                        ? "bg-tertiary/5 text-primary"
                        : "text-tertiary"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    onClick={() => setSelectedMode("write")}
                    disabled={disabled}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-3 rounded-full font-medium ${
                      selectedMode === "preview"
                        ? "bg-tertiary/5 text-primary"
                        : "text-tertiary"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    onClick={() => setSelectedMode("preview")}
                    disabled={disabled}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export default MarkdownTextareaInput;
