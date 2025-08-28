import React, { forwardRef } from "react";
import Link from "next/link";

export const HeaderLink = forwardRef(
  ({ className, children, href, target, isActive, onClick }, ref) => {
    const activeClass = isActive
      ? "text-gray-900 z-10" // Active links use dark text for contrast on white overlay
      : "text-tertiary"; // Inactive links have tertiary text color

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
      >
        {children}
      </Link>
    );
  }
);

HeaderLink.displayName = "HeaderLink";
