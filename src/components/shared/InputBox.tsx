"use client";
import styles from "./styles.module.scss";

export default function InputBox({
  placeholder,
  onChange,
  value,
  ...props
}: {
  placeholder: string;
  value: any;
  onChange: (next: any) => void;
  [key: string]: any;
}) {
  return (
    <input
      className={styles.input_box}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onWheel={(e) => e.currentTarget.blur()}
      {...props}
    />
  );
}
