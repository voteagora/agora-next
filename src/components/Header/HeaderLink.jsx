import React from "react";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";

export const HeaderLink = ({ className, children, href, target, isActive }) => {
  const { ui } = Tenant.current();

  const activeClass = isActive
    ? `text-inherit text-primary border shadow-newDefault border-line`
    : "text-tertiary";

  return (
    <Link
      href={href}
      target={target}
      className={`px-4 rounded-full text-sm sm:text-base h-[38px] content-center ${activeClass} ${className || ""}`}
      style={
        isActive && ui.customization?.customButtonBackground
          ? {
              backgroundColor: ui.customization.customButtonBackground,
              borderColor: ui.customization.customButtonBackground,
            }
          : {}
      }
    >
      {children}
    </Link>
  );
};
