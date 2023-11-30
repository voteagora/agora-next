"use client";

import { css } from "@emotion/css";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import * as theme from "@/styles/theme";

export default function InfoPop({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={css`
        position: relative;
        display: inline-block;
      `}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <QuestionMarkCircleIcon
        className={css`
          color: ${theme.colors.gray.af};
          cursor: pointer;
          width: ${theme.spacing["4"]};
          margin-left: ${theme.spacing["1"]};
        `}
      />
      {isOpen && (
        <div
          className={css`
            position: absolute;
            top: 0;
            left: 100%;
            width: 300px;
            padding: ${theme.spacing["4"]};
            background: ${theme.colors.black};
            border-radius: ${theme.borderRadius.lg};
            box-shadow: ${theme.boxShadow.md};
            z-index: 1;
          `}
        >
          <div
            className={css`
              font-size: ${theme.fontSize.sm};
              font-weight: ${theme.fontWeight.normal};
              color: ${theme.colors.white};
            `}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
