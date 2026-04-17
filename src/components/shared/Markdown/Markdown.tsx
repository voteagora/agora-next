"use client";
import rehypeExternalLinks from "rehype-external-links";
import MarkdownPreview from "@uiw/react-markdown-preview";
import styles from "./markdown.module.scss";
import Tenant from "@/lib/tenant/tenant";
import cn from "classnames";
import { fixBrokenNumberedLists } from "@/lib/sanitizationUtils";

const defaults = {
  primary: "23 23 23",
  secondary: "64 64 64",
  tertiary: "115 115 115",
  line: "229 229 229",
  positive: "0 153 43",
  font: "var(--font-inter)",
};

const toRGBA = (hex: string, alpha: number) => {
  return `rgba(${hex
    .split(" ")
    .map((n) => parseInt(n, 10))
    .join(",")}, ${alpha})`;
};

export default function Markdown({
  content,
  className,
  wrapperClassName,
  originalHierarchy = false,
}: {
  content: string;
  className?: string;
  wrapperClassName?: string;
  originalHierarchy?: boolean;
}) {
  const { ui } = Tenant.current();
  const primary = ui?.customization?.primary ?? defaults.primary;
  const secondary = ui?.customization?.secondary ?? defaults.secondary;
  const tertiary = ui?.customization?.tertiary ?? defaults.tertiary;
  const line = ui?.customization?.line ?? defaults.line;
  const positive = ui?.customization?.positive ?? defaults.positive;
  return (
    <div
      className={cn(
        styles.agora_markdown,
        "max-w-full text-primary",
        wrapperClassName
      )}
    >
      <MarkdownPreview
        source={fixBrokenNumberedLists(content)}
        style={
          {
            "--color-fg-default": toRGBA(secondary, 1),
            "--color-canvas-default": toRGBA(primary, 0),
            "--color-border-default": toRGBA(line, 1),
            "--color-border-muted": toRGBA(line, 1),
            "--color-canvas-subtle": toRGBA(tertiary, 0.05),
            "--color-prettylights-syntax-entity-tag": toRGBA(positive, 1),
            fontFamily: defaults.font,
          } as React.CSSProperties
        }
        className={cn("h-full py-3 max-w-full", className)}
        wrapperElement={{ "data-color-mode": "light" }}
        rehypePlugins={[() => rehypeExternalLinks({ target: "_blank" })]}
        components={{
          ...(!originalHierarchy
            ? {
                h2: ({ node, ...props }) => (
                  <h1 className="text-primary" {...props} />
                ),
              }
            : {}),
        }}
      />
    </div>
  );
}
