"use client";

import { css } from "@emotion/css";
import * as theme from "@/styles/theme";

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
      className={css`
        width: 100%;
        padding: ${theme.spacing["4"]};
        border: 1px solid ${theme.colors.gray.eb};
        background-color: ${theme.colors.gray.fa};
        border-radius: ${theme.borderRadius.md};
        font-size: ${theme.fontSize.base};
      `}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onWheel={(e) => e.currentTarget.blur()}
      {...props}
    />
  );
}
