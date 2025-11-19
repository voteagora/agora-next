"use client";

import { useState, useMemo } from "react";
import { useAccount, useConnect } from "wagmi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DynamicFormField from "./DynamicFormField";

interface FormField {
  id: string;
  type: "text" | "textarea" | "dropdown" | "checkbox" | "radio";
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  order?: number;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface Grant {
  id: string;
  title: string;
  description: string;
  slug: string;
  active: boolean;
  budgetRange?: string | null;
  deadline?: string | null;
  form_schema?: FormField[];
  bottom_text_config?: {
    type: "text" | "confirmation";
    content?: string;
    items?: Array<{
      id: string;
      text: string;
      required: boolean;
    }>;
  } | null;
}

interface GrantIntakeFormProps {
  grant: Grant;
}

// Helper function to render text with markdown-style links [text](url)
function renderTextWithLinks(text: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: Array<{ type: "text" | "link"; content: string; url?: string }> =
    [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }
    if (match[1] && match[2]) {
      parts.push({
        type: "link",
        content: match[1],
        url: match[2],
      });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, idx) =>
        part.type === "link" && part.url ? (
          <a
            key={idx}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {part.content}
          </a>
        ) : (
          <span key={idx}>{part.content}</span>
        )
      )}
    </>
  );
}

export default function GrantIntakeForm({ grant }: GrantIntakeFormProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build dynamic zod schema from form_schema
  const dynamicSchema = useMemo(() => {
    const allFields: Record<string, z.ZodTypeAny> = {};

    // Add confirmation checkboxes from bottom_text_config
    if (
      grant.bottom_text_config?.type === "confirmation" &&
      grant.bottom_text_config.items
    ) {
      grant.bottom_text_config.items.forEach((item) => {
        if (item.required) {
          allFields[`confirmation_${item.id}`] = z
            .boolean()
            .refine((val) => val === true, `${item.text} is required`);
        } else {
          allFields[`confirmation_${item.id}`] = z.boolean().optional();
        }
      });
    }

    // Add dynamic fields from form_schema
    if (
      grant.form_schema &&
      Array.isArray(grant.form_schema) &&
      grant.form_schema.length > 0
    ) {
      grant.form_schema.forEach((field) => {
        switch (field.type) {
          case "text":
            let textSchema: z.ZodString = z.string();
            if (field.required) {
              textSchema = textSchema.min(1, `${field.label} is required`);
            }
            if (field.validation?.minLength) {
              textSchema = textSchema.min(
                field.validation.minLength,
                `Must be at least ${field.validation.minLength} characters`
              );
            }
            if (field.validation?.maxLength) {
              textSchema = textSchema.max(
                field.validation.maxLength,
                `Must be no more than ${field.validation.maxLength} characters`
              );
            }
            if (field.validation?.pattern) {
              textSchema = textSchema.regex(
                new RegExp(field.validation.pattern),
                "Invalid format"
              );
            }
            allFields[field.id] = textSchema;
            break;
          case "textarea":
            let textareaSchema: z.ZodString = z.string();
            if (field.required) {
              textareaSchema = textareaSchema.min(
                1,
                `${field.label} is required`
              );
            }
            if (field.validation?.minLength) {
              textareaSchema = textareaSchema.min(
                field.validation.minLength,
                `Must be at least ${field.validation.minLength} characters`
              );
            }
            if (field.validation?.maxLength) {
              textareaSchema = textareaSchema.max(
                field.validation.maxLength,
                `Must be no more than ${field.validation.maxLength} characters`
              );
            }
            allFields[field.id] = textareaSchema;
            break;
          case "dropdown":
          case "radio":
            let selectSchema: z.ZodString = z.string();
            if (field.required) {
              selectSchema = selectSchema.min(1, `${field.label} is required`);
            }
            allFields[field.id] = selectSchema;
            break;
          case "checkbox":
            let checkboxSchema: z.ZodTypeAny = z.boolean();
            if (field.required) {
              checkboxSchema = checkboxSchema.refine(
                (val) => val === true,
                `${field.label} is required`
              );
            }
            allFields[field.id] = checkboxSchema;
            break;
        }
      });
    }

    return z.object(allFields);
  }, [grant.form_schema, grant.bottom_text_config]);

  type GrantFormData = z.infer<typeof dynamicSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<GrantFormData>({
    resolver: zodResolver(dynamicSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: GrantFormData) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch(`/api/grants/${grant.slug}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          applicantAddress: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      await response.json();

      // Redirect to thank you page after successful submission
      router.push(`/grants/${grant.slug}/thank-you`);
    } catch (error) {
      console.error("Error submitting grant application:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "There was an error submitting your application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    } else {
      toast.error("No wallet connectors available");
    }
  };

  // Sort dynamic fields by order if available
  // Must be called before any early returns to follow Rules of Hooks
  const sortedFields = useMemo(() => {
    if (!grant.form_schema || !Array.isArray(grant.form_schema)) {
      return [];
    }
    return [...grant.form_schema].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }, [grant.form_schema]);

  if (!isConnected) {
    return (
      <button
        onClick={handleConnectWallet}
        className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        Connect Wallet to Apply for This Grant
      </button>
    );
  }

  return (
    <div className="bg-white border border-line rounded-lg p-8">
      <h2 className="text-xl font-semibold text-primary mb-6">
        Submit Application for {grant.title}
      </h2>

      <p className="text-tertiary mb-6">
        Fill in the details below to submit your grant application.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dynamic Fields from form_schema */}
        {sortedFields.length > 0 ? (
          <div className="space-y-6">
            {sortedFields.map((field) => (
              <DynamicFormField
                key={field.id}
                field={field}
                register={register}
                errors={errors}
                watch={watch}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-tertiary">
            <p>No form fields have been configured for this grant.</p>
          </div>
        )}

        {/* Bottom Text Config - Informational Notice or Confirmations */}
        {grant.bottom_text_config && (
          <div className="space-y-4 pt-4 border-t border-line">
            {grant.bottom_text_config.type === "text" &&
              grant.bottom_text_config.content && (
                <div className="bg-wash rounded-lg p-4">
                  <div className="text-sm text-tertiary whitespace-pre-wrap">
                    {renderTextWithLinks(grant.bottom_text_config.content)}
                  </div>
                </div>
              )}
            {grant.bottom_text_config.type === "confirmation" &&
              grant.bottom_text_config.items &&
              grant.bottom_text_config.items.length > 0 && (
                <div className="space-y-3">
                  {grant.bottom_text_config.items.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <input
                        {...register(`confirmation_${item.id}` as any)}
                        type="checkbox"
                        id={`confirmation_${item.id}`}
                        className="mt-1 mr-3"
                      />
                      <label
                        htmlFor={`confirmation_${item.id}`}
                        className="text-sm text-tertiary"
                      >
                        {item.text}
                        {item.required && (
                          <span className="text-negative ml-1">*</span>
                        )}
                      </label>
                    </div>
                  ))}
                  {grant.bottom_text_config.items.map((item) => {
                    const errorKey = `confirmation_${item.id}`;
                    const error = (errors as any)[errorKey];
                    return error ? (
                      <p
                        key={`error_${item.id}`}
                        className="text-sm text-negative"
                      >
                        {error.message as string}
                      </p>
                    ) : null;
                  })}
                </div>
              )}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-line">
        <div className="bg-wash rounded-lg p-4">
          <h4 className="font-semibold text-primary mb-2">Important Notes:</h4>
          <ul className="text-sm text-tertiary space-y-1">
            <li>• Once submitted, you cannot edit your application</li>
            <li>
              • You will receive an email confirmation with your submission
              details
            </li>
            <li>
              • Make sure you follow us on{" "}
              <a
                href="https://x.com/syndicateio"
                className="text-primary hover:underline"
              >
                @syndicateio
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
