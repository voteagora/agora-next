import { CustomHTMLBlockConfig } from "@/lib/blocks/types";
import DOMPurify from "isomorphic-dompurify";

interface CustomHTMLBlockProps {
  config: CustomHTMLBlockConfig;
}

export function CustomHTMLBlock({ config }: CustomHTMLBlockProps) {
  const shouldSanitize = config.sanitize !== false; // default to true
  const htmlContent = shouldSanitize
    ? DOMPurify.sanitize(config.html)
    : config.html;

  return (
    <div className="mt-6" dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
