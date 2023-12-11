"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import styles from "./styles.module.scss";

export default function InfoPop({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <QuestionMarkCircleIcon className={styles.info_pop} />
      {isOpen && (
        <div className={styles.info_pop__tooltip}>
          <div className={styles.info_pop__tooltip}>{children}</div>
        </div>
      )}
    </div>
  );
}
