"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";

interface FormField {
  id: string;
  type: "text" | "textarea" | "dropdown" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface DynamicFormFieldProps {
  field: FormField;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  register,
  errors,
  watch,
}) => {
  const commonProps = {
    id: field.id,
    ...register(field.id, {
      required: field.required ? `${field.label} is required` : false,
      minLength: field.validation?.minLength
        ? {
            value: field.validation.minLength,
            message: `Must be at least ${field.validation.minLength} characters`,
          }
        : undefined,
      maxLength: field.validation?.maxLength
        ? {
            value: field.validation.maxLength,
            message: `Must be no more than ${field.validation.maxLength} characters`,
          }
        : undefined,
      pattern: field.validation?.pattern
        ? {
            value: new RegExp(field.validation.pattern),
            message: "Invalid format",
          }
        : undefined,
    }),
    placeholder: field.placeholder,
    className:
      "w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
  };

  const renderField = () => {
    switch (field.type) {
      case "text":
        return <input type="text" {...commonProps} />;
      case "textarea":
        return <textarea rows={field.rows || 4} {...commonProps} />;
      case "dropdown":
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              {...register(field.id, {
                required: field.required ? `${field.label} is required` : false,
              })}
              checked={watch(field.id)}
              className="h-4 w-4 text-primary focus:ring-primary/20 border-line rounded"
            />
            <label
              htmlFor={field.id}
              className="text-sm font-medium text-primary"
            >
              {field.label}
              {field.required && <span className="text-negative ml-1">*</span>}
            </label>
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary mb-2">
              {field.label}
              {field.required && <span className="text-negative ml-1">*</span>}
            </label>
            {field.options && field.options.length > 0 ? (
              <div className="space-y-3">
                {field.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="radio"
                      id={`${field.id}-${option.value}`}
                      value={option.value}
                      {...register(field.id, {
                        required: field.required
                          ? `${field.label} is required`
                          : false,
                      })}
                      className="h-4 w-4 text-primary focus:ring-primary/20 border-line cursor-pointer"
                    />
                    <label
                      htmlFor={`${field.id}-${option.value}`}
                      className="text-sm font-normal text-primary cursor-pointer flex-1"
                    >
                      {option.label || option.value}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-wash border border-line rounded-md p-3">
                <p className="text-sm text-negative">
                  No options configured for this field. Please add options in
                  the admin panel.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== "checkbox" && field.type !== "radio" && (
        <label
          htmlFor={field.id}
          className="block text-sm font-medium text-primary mb-2"
        >
          {field.label}
          {field.required && <span className="text-negative ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {field.helperText && (
        <p className="text-xs text-muted-foreground">{field.helperText}</p>
      )}
      {errors[field.id] && (
        <p className="mt-1 text-sm text-negative">
          {errors[field.id]?.message as string}
        </p>
      )}
    </div>
  );
};

export default DynamicFormField;
