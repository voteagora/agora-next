"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import styles from "./markdown.module.scss";
import Tenant from "@/lib/tenant/tenant";
import cn from "classnames";

const defaults = {
  primary: "23 23 23",
  secondary: "64 64 64",
  tertiary: "115 115 115",
  neutral: "255 255 255",
  wash: "250 250 250",
  line: "229 229 229",
  positive: "0 153 43",
  negative: "197 47 0",
  brandPrimary: "23 23 23",
  brandSecondary: "255 255 255",
  font: "var(--font-inter)",
};

const toRGBA = (hex: string, alpha: number) => {
  return `rgba(${hex
    .split(" ")
    .map((n) => parseInt(n, 10))
    .join(",")}, ${alpha})`;
};

export default function Markdown({ content }: { content: string }) {
  const { ui } = Tenant.current();
  const primary = ui?.customization?.primary ?? defaults.primary;
  const secondary = ui?.customization?.secondary ?? defaults.secondary;
  const tertiary = ui?.customization?.tertiary ?? defaults.tertiary;
  const line = ui?.customization?.line ?? defaults.line;
  const positive = ui?.customization?.positive ?? defaults.positive;
  return (
    <div className={cn(styles.proposal_description_md, "max-w-full")}>
      <MarkdownPreview
        source={content}
        style={
          {
            "--color-fg-default": toRGBA(secondary, 1),
            "--color-canvas-default": toRGBA(primary, 0),
            "--color-border-default": toRGBA(line, 1),
            "--color-border-muted": toRGBA(line, 1),
            "--color-canvas-subtle": toRGBA(tertiary, 0.05),
            "--color-prettylights-syntax-entity-tag": toRGBA(positive, 1),
            fontFamily: ui?.customization?.font ?? defaults.font,
          } as React.CSSProperties
        }
        className={`h-full py-3 max-w-full bg-transparent prose prose-code:bg-wash prose-code:text-primary`}
        wrapperElement={{
          "data-color-mode": "light",
        }}
      />
    </div>
  );
}
