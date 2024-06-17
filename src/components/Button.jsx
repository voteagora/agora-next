import Link from "next/link";

export function Button({ href = "", className = "", ...props }) {
  return (
    <>
      {href ? (
        <div
          className={`
            bg-theme-900 text-white rounded-lg border border-theme-100 font-medium shadow-newDefault hover:shadow-newHover active:shadow-none active:bg-theme-100 disabled:bg-theme-100 disabled:text-theme-700 cursor-pointer px-4 py-3 transition-all
            ${className}
            `}
        >
          <Link href={href} {...props} />{" "}
        </div>
      ) : (
        <button
          className={`
            bg-theme-900 text-white rounded-lg border border-theme-100 font-medium shadow-newDefault hover:shadow-newHover active:shadow-none active:bg-theme-100 disabled:bg-theme-100 disabled:text-theme-700 cursor-pointer px-4 py-3 transition-all
            ${className}`}
          {...props}
        />
      )}
    </>
  );
}
