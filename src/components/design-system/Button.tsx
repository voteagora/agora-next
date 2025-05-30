import React from "react";
import cn from "classnames";

/**
 * Design System Button
 *
 * Variants: primary, secondary, text
 * Sizes: large (48px), small (40px)
 * Fully rounded (border-radius: 1000px)
 * All tokens, interaction states, and icon support per design system
 *
 * For primary buttons, you can set primaryTextColor to 'wash' (default, white text) or 'primary' (dark text).
 */

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "large" | "small";
type PrimaryTextColor = "wash" | "primary";

export interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  /**
   * For primary buttons only: sets text color to 'wash' (white) or 'primary' (dark)
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
        "font-bold text-base transition-all rounded-[1000px] px-5 flex items-center justify-center gap-2 select-none",
        size === "large" ? "h-12 min-h-[48px]" : "h-10 min-h-[40px]",
        fullWidth && "w-full",
        // Variants
        variant === "primary" && [
          "bg-brandPrimary border-none",
          primaryTextColor === "wash" ? "text-wash" : "text-primary"
        ],
        variant === "secondary" &&
          "bg-wash text-primary border border-primary",
        variant === "text" &&
          "bg-transparent text-primary border-none shadow-none px-0",
        // Interaction states
        !disabled &&
          !loading &&
          [
            variant !== "text"
              ? "hover:shadow-[0px_2px_6px_rgba(0,0,0,0.08),0px_4px_12px_rgba(0,0,0,0.08)]"
              : "hover:underline focus:underline underline-offset-4",
            "focus:brightness-90"
          ],
        disabled &&
          "bg-tertiary opacity-50 pointer-events-none text-primary border-none",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {iconBefore && <span className="flex-shrink-0 w-4 h-4">{iconBefore}</span>}
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
 * <DSButton variant="secondary" size="small">Secondary</DSButton>
 * <DSButton variant="text" iconAfter={<Icon />}>Text Link</DSButton>
 */ 