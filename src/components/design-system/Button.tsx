import React from "react";
import cn from "classnames";

/**
 * Design System Button: the LATEST button component to be used globally in the app
 *
 * Variants: primary, secondary, text
 * Sizes: large (48px), small (40px)
 * Fully rounded (border-radius: 1000px)
 * All tokens, interaction states, and icon support per design system
 *
 * For primary buttons, you can set primaryTextColor to 'wash' (default, white text), 'primary' (dark text), or 'black' (black background, white text).
 */

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "large" | "small";
type PrimaryTextColor = "wash" | "primary" | "black" | "white";

export interface DSButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  /**
   * For primary buttons only: sets text color to 'wash' (white), 'primary' (dark), or 'black' (black background, white text)
   */
  primaryTextColor?: PrimaryTextColor;
}

export const DSButton: React.FC<DSButtonProps> = ({
  variant = "primary",
  size = "large",
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
        // Base styles
        variant === "primary" && primaryTextColor === "wash"
          ? "font-medium"
          : "font-medium",
        "text-base transition-all rounded-[1000px] px-5 flex items-center justify-center gap-2 select-none",
        size === "large" ? "h-12 min-h-[48px]" : "h-10 min-h-[40px]",
        fullWidth && "w-full",
        // Variants
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
          "bg-neutral text-primary rounded-[1000px] border border-line font-medium shadow-newDefault cursor-pointer px-5 py-3 transition-all",
          "hover:shadow-newHover active:shadow-none active:bg-line disabled:bg-line disabled:text-secondary",
        ],
        variant === "text" &&
          "bg-transparent text-primary border-none shadow-none px-0",
        // Interaction states
        !disabled &&
          !loading && [
            variant !== "text"
              ? "hover:shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_4px_12px_rgba(0,0,0,0.08)]"
              : "hover:underline focus:underline underline-offset-4",
            "focus:brightness-90",
          ],
        disabled &&
          "bg-tertiary opacity-50 pointer-events-none text-primary border-none",
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

/**
 * Usage Example:
 *
 * <DSButton variant="primary" size="large">Primary Action</DSButton>
 * <DSButton variant="primary" size="large" primaryTextColor="primary">Primary (dark text)</DSButton>
 * <DSButton variant="primary" size="large" primaryTextColor="black">Primary (black bg, white text)</DSButton>
 * <DSButton variant="primary" size="large" primaryTextColor="white">Primary (white bg, black text)</DSButton>
 * <DSButton variant="secondary" size="small">Secondary</DSButton>
 * <DSButton variant="text" iconAfter={<Icon />}>Text Link</DSButton>
 */
