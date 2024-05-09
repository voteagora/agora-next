import Link from "next/link";
import styles from "./styles.module.scss";

export function Button({ href = "", className = "", ...props }) {
  return (
    <>
      {href ? (
        <div className={`${styles.button} ${className}`}>
          <Link href={href} {...props} />{" "}
        </div>
      ) : (
        <button className={`${styles.button} ${className}`} {...props} />
      )}
    </>
  );
}

// Button with styles that follow mocks in figma
// plan is to replace all buttons with this one
export function UpdatedButton({
  type = "primary",
  variant = "",
  href = "",
  className = "",
  isSubmit = false,
  fullWidth = false,
  children,
  ...props
}: {
  type?: "primary" | "secondary" | "link";
  variant?: "rounded" | "";
  href?: string;
  className?: string;
  isSubmit?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  [x: string]: any;
}) {
  const classNameString = `${
    type === "primary"
      ? "bg-agora-stone-900 hover:bg-agora-stone-700 text-white"
      : type === "secondary"
        ? ""
        : type === "link"
          ? ""
          : ""
  } ${variant === "rounded" ? "rounded-full" : "rounded-md"} ${fullWidth && "w-full"} font-semibold py-2 px-4 border border-agora-stone-100 cursor-pointer ${className}`;
  return (
    <>
      {href ? (
        <div className={classNameString}>
          <Link href={href} {...props}>
            {children}
          </Link>
        </div>
      ) : (
        <button
          className={classNameString}
          {...props}
          type={isSubmit ? "submit" : "button"}
        >
          {children}
        </button>
      )}
    </>
  );
}
