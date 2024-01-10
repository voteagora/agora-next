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
