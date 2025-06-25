import Link from "next/link";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import React from "react";

const { ui } = Tenant.current();

const themeIsDark = ui.theme === "dark";

export function Button({ href = "", className = "", ...props }) {
  return (
    <>
      {href ? (
        <div
          className={`rounded-lg border border-line font-medium shadow-newDefault cursor-pointer transition-all px-4 py-3 hover:shadow-newHover ${className}`}
        >
          <Link href={href} {...props} />{" "}
        </div>
      ) : (
        <button
          className={`bg-neutral text-primary rounded-lg border border-line font-medium shadow-newDefault cursor-pointer transition-all px-4 py-3 hover:shadow-newHover ${className}`}
          {...props}
        />
      )}
    </>
  );
}

// UpdatedButton - use this for any button implementation
type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "large" | "small";
type PrimaryTextColor = "wash" | "primary" | "black" | "white";

export interface UpdatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  primaryTextColor?: PrimaryTextColor;
}

export const UpdatedButton: React.FC<UpdatedButtonProps> = ({
  variant = "primary",
  size = "small",
  iconBefore,
  iconAfter,
  loading = false,
  disabled,
  fullWidth = false,
  primaryTextColor = "wash",
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        variant === "primary" && primaryTextColor === "wash"
          ? "font-medium"
          : "font-medium",
        "text-base transition-all rounded-[1000px] px-5 flex items-center justify-center gap-2 select-none",
        size === "large" ? "h-12 min-h-[48px]" : "h-10 min-h-[40px]",
        fullWidth && "w-full",
        variant === "primary" && [
          primaryTextColor === "black"
            ? "bg-black text-white"
            : primaryTextColor === "white"
              ? "bg-white text-black"
              : [
                  "bg-brandPrimary",
                  primaryTextColor === "wash" ? "text-wash" : "text-primary",
                ],
        ],
        variant === "secondary" && [
          "bg-neutral text-primary rounded-[1000px] border border-line font-medium cursor-pointer px-5 py-3 transition-all",
          "hover:shadow-newHover active:shadow-none active:bg-line disabled:bg-line disabled:text-secondary",
        ],
        variant === "text" &&
          "bg-transparent text-primary border-none shadow-none px-0",
        !disabled &&
          !loading && [
            variant !== "text"
              ? "hover:shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_4px_12px_rgba(0,0,0,0.08)]"
              : "hover:underline focus:underline underline-offset-4",
            "focus:brightness-90",
          ],
        disabled &&
          "bg-tertiary opacity-50 pointer-events-none text-wash border-none",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {iconBefore && (
        <span className="flex-shrink-0 w-4 h-4">{iconBefore}</span>
      )}
      {loading ? <span>Loading...</span> : <span>{children}</span>}
      {iconAfter && <span className="flex-shrink-0 w-4 h-4">{iconAfter}</span>}
    </button>
  );
};

// OldButton - use UpdatedButton instead
export function OldButton({
  type = "primary",
  variant = "",
  href = "",
  className = "",
  isSubmit = false,
  isLoading = false,
  fullWidth = false,
  children,
  ...props
}: {
  type?: "primary" | "secondary" | "link" | "destructive" | "disabled";
  variant?: "rounded" | "";
  href?: string;
  className?: string;
  isSubmit?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  [x: string]: any;
}) {
  return (
    <>
      {href ? (
        <div
          className={cn(
            className,
            type === "primary" &&
              "bg-primary hover:bg-primary/90 text-neutral transition-colors",
            type === "secondary" && "",
            type === "link" && "",
            variant === "rounded" && "rounded-full",
            fullWidth && "w-full",
            "font-semibold py-2 px-4 border border-line cursor-pointer"
          )}
        >
          <Link href={href} {...props}>
            {children}
          </Link>
        </div>
      ) : (
        <button
          className={cn(
            className,
            "font-semibold py-2 px-4 border border-line cursor-pointer",
            type === "primary" &&
              "bg-brandPrimary hover:bg-brandPrimary/90 text-neutral transition-shadow",
            type === "secondary" &&
              "bg-neutral text-primary hover:shadow-newDefault",
            type === "link" && "",
            type === "destructive" &&
              "bg-white text-red-500 hover:text-red-700",
            type === "disabled" &&
              "bg-agora-stone-50 text-agora-stone-100 cursor-not-allowed",
            variant === "rounded" ? "rounded-full" : "rounded-lg",
            fullWidth && "w-full"
          )}
          {...props}
          type={isSubmit ? "submit" : "button"}
        >
          {isLoading ? (
            <span
              className={cn(
                type === "primary" && !themeIsDark && "text-white",
                type === "secondary" && !themeIsDark && "text-black",
                type === "destructive" && !themeIsDark && "text-red-500",
                type === "link" && "",
                "font-semibold flex flex-row space-x-2 items-center justify-center"
              )}
            >
              <LoadingSpinner
                className={cn(
                  type === "primary" && !themeIsDark && "text-white",
                  type === "secondary" && !themeIsDark && "text-black",
                  type === "destructive" && !themeIsDark && "text-red-500",
                  type === "link" && "",
                  "font-semibold"
                )}
              />
              <p>loading...</p>
            </span>
          ) : (
            children
          )}
        </button>
      )}
    </>
  );
}
