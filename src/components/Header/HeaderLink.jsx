import React from "react";
import Link from "next/link";

export const HeaderLink = ({ className, children, href, target, isActive }) => {
  const activeClass = isActive ? "bg-theme-100 text-inherit" : "";

  return (
    <Link
      href={href}
      target={target}
      className={`py-1 px-4 rounded-full text-theme-700 text-sm sm:text-base ${activeClass} ${className || ""}`}
    >
      {children}
    </Link>
  );
};
