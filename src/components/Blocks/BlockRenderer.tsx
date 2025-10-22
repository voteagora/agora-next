import { PageBlock } from "@prisma/client";
import { HeroBlock } from "./HeroBlock";
import { AboutBlock } from "./AboutBlock";
import { CardGridBlock } from "./CardGridBlock";
import { TimelineBlock } from "./TimelineBlock";
import { TextContentBlock } from "./TextContentBlock";
import { ImageBannerBlock } from "./ImageBannerBlock";
import { CTASectionBlock } from "./CTASectionBlock";
import { GovernanceChartsBlock } from "./GovernanceChartsBlock";
import { CustomHTMLBlock } from "./CustomHTMLBlock";
import { GovernorSettingsBlock } from "./GovernorSettingsBlock";
import { DUNAInfoBlock } from "./DUNAInfoBlock";
import { DisclosuresBlock } from "./DisclosuresBlock";
import type {
  HeroBlockConfig,
  AboutBlockConfig,
  CardGridBlockConfig,
  TimelineBlockConfig,
  TextContentBlockConfig,
  ImageBannerBlockConfig,
  CTASectionBlockConfig,
  GovernanceChartsBlockConfig,
  CustomHTMLBlockConfig,
  GovernorSettingsBlockConfig,
  DUNAInfoBlockConfig,
  DisclosuresBlockConfig,
} from "@/lib/blocks/types";

interface BlockRendererProps {
  block: PageBlock;
}

/**
 * BlockRenderer - Routes blocks to their appropriate component
 * This is the central dispatcher for all block types
 */
export function BlockRenderer({ block }: BlockRendererProps) {
  if (!block.enabled) {
    return null;
  }

  try {
    switch (block.block_type) {
      case "hero":
        return (
          <HeroBlock config={block.config as unknown as HeroBlockConfig} />
        );

      case "about":
        return (
          <AboutBlock config={block.config as unknown as AboutBlockConfig} />
        );

      case "card_grid":
        return (
          <CardGridBlock
            config={block.config as unknown as CardGridBlockConfig}
          />
        );

      case "timeline":
        return (
          <TimelineBlock
            config={block.config as unknown as TimelineBlockConfig}
          />
        );

      case "text_content":
        return (
          <TextContentBlock
            config={block.config as unknown as TextContentBlockConfig}
          />
        );

      case "image_banner":
        return (
          <ImageBannerBlock
            config={block.config as unknown as ImageBannerBlockConfig}
          />
        );

      case "cta_section":
        return (
          <CTASectionBlock
            config={block.config as unknown as CTASectionBlockConfig}
          />
        );

      case "governance_charts":
        return (
          <GovernanceChartsBlock
            config={block.config as unknown as GovernanceChartsBlockConfig}
          />
        );

      case "custom_html":
        return (
          <CustomHTMLBlock
            config={block.config as unknown as CustomHTMLBlockConfig}
          />
        );

      case "governor_settings":
        return (
          <GovernorSettingsBlock
            config={block.config as unknown as GovernorSettingsBlockConfig}
          />
        );

      case "duna_info":
        return (
          <DUNAInfoBlock
            config={block.config as unknown as DUNAInfoBlockConfig}
          />
        );

      case "disclosures":
        return (
          <DisclosuresBlock
            config={block.config as unknown as DisclosuresBlockConfig}
          />
        );

      default:
        console.warn(`Unknown block type: ${block.block_type}`);
        return (
          <div className="py-8 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Unknown block type: <code>{block.block_type}</code>
            </p>
          </div>
        );
    }
  } catch (error) {
    console.error(`Error rendering block ${block.id}:`, error);
    return (
      <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">
          Error rendering block: {block.block_type}
        </p>
      </div>
    );
  }
}
