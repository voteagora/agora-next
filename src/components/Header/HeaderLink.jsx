import React, { forwardRef } from "react";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";

export const HeaderLink = forwardRef(
  ({ className, children, href, target, isActive, onClick }, ref) => {
    const { ui } = Tenant.current();

    const activeClass = isActive
      ? `text-primary border shadow-newDefault border-line z-10`
      : "text-tertiary";

    const handleClick = (e) => {
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <Link
        ref={ref}
        href={href}
        target={target}
        onClick={handleClick}
        className={`px-4 rounded-full text-sm sm:text-base h-[38px] content-center flex items-center relative ${activeClass} ${className || ""}`}
        style={
          isActive && ui.customization?.buttonBackground
            ? {
                backgroundColor: `rgb(${ui.customization.buttonBackground})`,
                borderColor: `rgb(${ui.customization.buttonBackground})`,
              }
            : {}
        }
      >
        {children}
      </Link>
    );
  }
);

HeaderLink.displayName = "HeaderLink";
