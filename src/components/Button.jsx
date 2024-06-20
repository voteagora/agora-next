import Link from "next/link";

export function Button({ href = "", className = "", ...props }) {
  return (
    <>
      {href ? (
        <div
          className={`
            bg-neutral text-primary rounded-lg border border-line font-medium shadow-newDefault hover:shadow-newHover active:shadow-none active:bg-line disabled:bg-line disabled:text-secondary cursor-pointer px-4 py-3 transition-all
            ${className}
            `}
        >
          <Link href={href} {...props} />{" "}
        </div>
      ) : (
        <button
          className={`
            bg-nuetral text-primary rounded-lg border border-line font-medium shadow-newDefault hover:shadow-newHover active:shadow-none active:bg-line disabled:bg-line disabled:text-secondary cursor-pointer px-4 py-3 transition-all
            ${className}`}
          {...props}
        />
      )}
    </>
  );
}
