import { TextContentBlockConfig } from "@/lib/blocks/types";

interface TextContentBlockProps {
  config: TextContentBlockConfig;
}

export function TextContentBlock({ config }: TextContentBlockProps) {
  const style = config.style || "default";

  const getStyleClasses = () => {
    switch (style) {
      case "callout":
        return "rounded-xl border-l-4 border-brandPrimary bg-infoSectionBackground p-6 shadow-sm";
      case "quote":
        return "border-l-4 border-line pl-6 py-2 italic text-lg text-secondary";
      default:
        return "";
    }
  };

  return (
    <div className="mt-6">
      <div
        className={`prose prose-base max-w-none text-secondary ${getStyleClasses()}`}
        dangerouslySetInnerHTML={{ __html: config.content }}
      />
    </div>
  );
}
