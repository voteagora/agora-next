import Link from "next/link";
import clsx from "clsx";

export function Button({ href, className, ...props }) {
  className = clsx(
    "inline-flex justify-center rounded-2xl bg-gray-200 p-4 text-base font-semibold text-dark hover:bg-black-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
    className
  );

  return href ? (
    <Link href={href} className={className} {...props} />
  ) : (
    <button className={className} {...props} />
  );
}
