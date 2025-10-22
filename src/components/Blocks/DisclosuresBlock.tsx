import { DisclosuresBlockConfig } from "@/lib/blocks/types";

interface DisclosuresBlockProps {
  config: DisclosuresBlockConfig;
}

/**
 * Disclosures Block
 *
 * Displays legal disclosure text with consistent styling.
 * Used for DUNA disclosures and other legal notices.
 */
export function DisclosuresBlock({ config }: DisclosuresBlockProps) {
  return (
    <div id="duna-administration" className="mt-8">
      <div
        style={{
          color: "var(--stone-700, #4F4F4F)",
          fontSize: "14px",
          lineHeight: "19px",
        }}
      >
        {config.title && <div className="mb-6 font-medium">{config.title}</div>}

        <div
          className="font-medium whitespace-pre-line text-justify"
          dangerouslySetInnerHTML={{ __html: config.content }}
        />
      </div>

      {config.footer_note && (
        <div className="mt-12 pt-6 border-t border-line">
          <p className="text-secondary text-sm opacity-75">
            {config.footer_note}
          </p>
        </div>
      )}
    </div>
  );
}
