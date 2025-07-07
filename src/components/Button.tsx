import Link from "next/link";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

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

// Button with styles that follow mocks in figma
// plan is to replace all buttons with this one
export function UpdatedButton({
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
            "font-medium py-2 px-4 border border-line cursor-pointer shadow-newDefault"
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
            "font-medium py-2 px-4 border border-line cursor-pointer shadow-newDefault",
            type === "primary" &&
              "bg-brandPrimary hover:bg-brandPrimary/90 text-neutral transition-shadow",
            type === "secondary" &&
              "bg-neutral text-primary hover:shadow-newHover",
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
                "font-medium flex flex-row space-x-2 items-center justify-center"
              )}
            >
              <LoadingSpinner
                className={cn(
                  type === "primary" && !themeIsDark && "text-white",
                  type === "secondary" && !themeIsDark && "text-black",
                  type === "destructive" && !themeIsDark && "text-red-500",
                  type === "link" && "",
                  "font-medium"
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
