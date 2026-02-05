"use client";

import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

interface PreferenceToggleProps {
  checked: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  onChange: (nextValue: boolean) => void;
}

export default function PreferenceToggle({
  checked,
  disabled = false,
  isLoading = false,
  label,
  onChange,
}: PreferenceToggleProps) {
  const { ui } = Tenant.current();
  const isDarkTheme = ui.theme === "dark";
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      disabled={isDisabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border border-line transition-colors",
        checked
          ? isDarkTheme
            ? "bg-secondary"
            : "bg-primary"
          : isDarkTheme
            ? "bg-line"
            : "bg-neutral",
        isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full shadow-newDefault transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
          isDarkTheme
            ? checked
              ? "bg-cardBackground"
              : "bg-tertiary"
            : "bg-wash"
        )}
      />
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center text-primary">
          <LoadingSpinner className="h-3 w-3" />
        </span>
      ) : null}
    </button>
  );
}
