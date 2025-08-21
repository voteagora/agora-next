import React, { forwardRef } from "react";
import Link from "next/link";

export const HeaderLink = forwardRef(
  ({ className, children, href, target, isActive, onClick }, ref) => {
    const activeClass = isActive
      ? "text-primary z-10" // Active links have primary text color and higher z-index
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
