import React from "react";
import Link from "next/link";
import styles from "./header.module.scss";

export const HeaderLink = ({ className, children, href, target, isActive }) => {
  const activeClass = isActive ? styles.nav_link_active : "";

  return (
    <Link
      href={href}
      target={target}
      className={`${styles.nav_link} ${activeClass} ${className || ""}`}
    >
      {children}
    </Link>
  );
};
