"use client";

import InfoPop from "@/components/shared/InfoPop";
import { css, cx } from "@emotion/css";
import styles from "./styles.module.scss";

export default function LabelWithInfo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cx(styles.create_prop_form__label, "flex items-center")}>
      {label} <InfoPop>{children}</InfoPop>
    </label>
  );
}
