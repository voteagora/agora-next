import Link from "next/link";
import styles from "./styles.module.scss";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";

export function Button({ href = "", className = "", ...props }) {
  return (
    <>
      {href ? (
        <div className={`${styles.button} ${className}`}>
          <Link href={href} {...props} />{" "}
        </div>
      ) : (
        <button className={`${styles.button} ${className}`} {...props} />
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
              "bg-agora-stone-900 hover:bg-agora-stone-900/90 text-white transition-colors",
            type === "secondary" && "",
            type === "link" && "",
            variant === "rounded" && "rounded-full",
            fullWidth && "w-full",
            "font-semibold py-2 px-4 border border-agora-stone-100 cursor-pointer"
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
            "font-semibold py-2 px-4 border border-agora-stone-100 cursor-pointer",
            type === "primary" &&
              "bg-agora-stone-900 hover:shadow text-white transition-shadow",
            type === "secondary" && "",
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
                type === "primary" && "text-white",
                type === "secondary" && "text-black",
                type === "destructive" && "text-red-500",
                type === "link" && "",
                "font-semibold flex flex-row space-x-2 items-center justify-center"
              )}
            >
              <LoadingSpinner
                className={cn(
                  type === "primary" && "text-white",
                  type === "secondary" && "text-black",
                  type === "destructive" && "text-red-500",
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
