import Link from "next/link";
import clsx from "clsx";

export function Button({ href, className, ...props }) {
  className = className || "";

  return href ? (
    <Link href={href} className={className} {...props} />
  ) : (
    <button className={className} {...props} />
  );
}
