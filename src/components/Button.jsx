import Link from "next/link";
import styles from "./styles.module.scss";

export function Button({ href = "", ...props }) {
  return (
    <div className={`${styles.button} ${props.className || ""}`}>
      {href ? <Link href={href} {...props} /> : <button {...props} />}
    </div>
  );
}
