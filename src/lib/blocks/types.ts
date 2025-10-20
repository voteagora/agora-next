/**
 * Block-based page builder types
 * Each block type has a specific configuration interface
 */

import { Page, PageBlock } from "@prisma/client";

// All supported block types
export type BlockType =
  | "hero"
  | "about"
  | "card_grid"
  | "text_content"
  | "timeline"
  | "image_banner"
  | "cta_section"
  | "governance_charts"
  | "custom_html"
  | "governor_settings";

// Extended types with relations
export type PageWithBlocks = Page & {
  blocks: PageBlock[];
};

// ============================================================================
// Block Configuration Interfaces
// ============================================================================

/**
 * Hero block - Large header with title, description, and optional CTA
 */
export interface HeroBlockConfig {
  title: string;
  description: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  background_color?: string;
}

/**
 * About block - Rich content section with tabs/sections
 */
export interface AboutBlockConfig {
  title: string;
  subtitle?: string;
  description: string;
  image_url?: string;
  tabs?: Array<{
    title: string;
    description: string;
    icon_type?: "coins" | "notification" | "check" | "document" | "users";
  }>;
}

/**
 * Card Grid - Grid of cards with images and links
 */
export interface CardGridBlockConfig {
  title?: string;
  columns: 2 | 3 | 4; // Grid columns
  cards: Array<{
    title: string;
    url: string;
    image_url: string;
    description?: string;
  }>;
}

/**
 * Timeline - Vertical timeline with events
 */
export interface TimelineBlockConfig {
  title?: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
    status: "completed" | "active" | "upcoming";
  }>;
}

/**
 * Text Content - Simple markdown/HTML content block
 */
export interface TextContentBlockConfig {
  content: string; // markdown or HTML
  style?: "default" | "callout" | "quote";
  background?: string;
}

/**
 * Image Banner - Full-width image with optional overlay text
 */
export interface ImageBannerBlockConfig {
  image_url: string;
  alt_text?: string;
  overlay_text?: string;
  overlay_position?: "top" | "center" | "bottom";
  height?: "small" | "medium" | "large" | "full";
}

/**
 * CTA Section - Call to action with button(s)
 */
export interface CTASectionBlockConfig {
  title: string;
  description?: string;
  buttons: Array<{
    text: string;
    url: string;
    style?: "primary" | "secondary" | "outline";
  }>;
  background_color?: string;
}

/**
 * Governance Charts - Embeds existing governance chart components
 */
export interface GovernanceChartsBlockConfig {
  chart_types: Array<
    | "treasury"
    | "active_delegates"
    | "avg_votes"
    | "required_delegates"
    | "top_delegates"
    | "votable_supply"
  >;
  title?: string;
}

/**
 * Custom HTML - Raw HTML content (use with caution)
 */
export interface CustomHTMLBlockConfig {
  html: string;
  sanitize?: boolean; // whether to sanitize HTML
}

/**
 * Governor Settings - Displays governance parameters and contract info
 * Uses Tenant.current() for all configuration - no config needed
 */
export interface GovernorSettingsBlockConfig {
  // No config needed - component is fully self-contained
  // All data comes from Tenant.current() and blockchain
}

// ============================================================================
// Type Guards
// ============================================================================

export function isHeroBlock(config: unknown): config is HeroBlockConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "description" in config
  );
}

export function isAboutBlock(config: unknown): config is AboutBlockConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "description" in config
  );
}

export function isCardGridBlock(
  config: unknown
): config is CardGridBlockConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "columns" in config &&
    "cards" in config
  );
}

export function isTimelineBlock(
  config: unknown
): config is TimelineBlockConfig {
  return typeof config === "object" && config !== null && "events" in config;
}

export function isTextContentBlock(
  config: unknown
): config is TextContentBlockConfig {
  return typeof config === "object" && config !== null && "content" in config;
}

export function isImageBannerBlock(
  config: unknown
): config is ImageBannerBlockConfig {
  return typeof config === "object" && config !== null && "image_url" in config;
}

export function isCTASectionBlock(
  config: unknown
): config is CTASectionBlockConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "title" in config &&
    "buttons" in config
  );
}

export function isGovernanceChartsBlock(
  config: unknown
): config is GovernanceChartsBlockConfig {
  return (
    typeof config === "object" && config !== null && "chart_types" in config
  );
}

export function isCustomHTMLBlock(
  config: unknown
): config is CustomHTMLBlockConfig {
  return typeof config === "object" && config !== null && "html" in config;
}

// Union type of all block configs
export type BlockConfig =
  | HeroBlockConfig
  | AboutBlockConfig
  | CardGridBlockConfig
  | TimelineBlockConfig
  | TextContentBlockConfig
  | ImageBannerBlockConfig
  | CTASectionBlockConfig
  | GovernanceChartsBlockConfig
  | CustomHTMLBlockConfig
  | GovernorSettingsBlockConfig;
