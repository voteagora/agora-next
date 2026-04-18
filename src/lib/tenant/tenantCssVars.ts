import { TenantUI } from "./tenantUI";

export const CSS_VAR_DEFAULTS = {
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
  letterSpacing: "0",
};

export function buildTenantCssVars(
  customization: TenantUI["customization"]
): Record<string, string> {
  const c = customization;

  const primary = c?.primary || CSS_VAR_DEFAULTS.primary;
  const secondary = c?.secondary || CSS_VAR_DEFAULTS.secondary;
  const tertiary = c?.tertiary || CSS_VAR_DEFAULTS.tertiary;
  const neutral = c?.neutral || CSS_VAR_DEFAULTS.neutral;
  const wash = c?.wash || CSS_VAR_DEFAULTS.wash;
  const line = c?.line || CSS_VAR_DEFAULTS.line;
  const positive = c?.positive || CSS_VAR_DEFAULTS.positive;
  const negative = c?.negative || CSS_VAR_DEFAULTS.negative;
  const brandPrimary = c?.brandPrimary || CSS_VAR_DEFAULTS.brandPrimary;
  const brandSecondary = c?.brandSecondary || CSS_VAR_DEFAULTS.brandSecondary;

  return {
    "--primary": primary,
    "--secondary": secondary,
    "--tertiary": tertiary,
    "--neutral": neutral,
    "--wash": wash,
    "--line": line,
    "--positive": positive,
    "--negative": negative,
    "--brand-primary": brandPrimary,
    "--brand-secondary": brandSecondary,
    "--info-section-background": c?.infoSectionBackground || neutral,
    "--header-background": c?.headerBackground || wash,
    "--info-tab-background": c?.infoTabBackground || neutral,
    "--button-background": c?.buttonBackground || primary,
    "--card-background": c?.cardBackground || "255 255 255",
    "--card-border": c?.cardBorder || line,
    "--card-background-light": c?.cardBackground || "255 255 255",
    "--card-background-dark": c?.cardBackground || "30 26 47",
    "--hover-background-light": c?.hoverBackground || "249 250 251",
    "--hover-background-dark": c?.hoverBackground || "42 35 56",
    "--modal-background-dark": c?.cardBackground || "30 26 47",
    "--input-background-dark": c?.cardBackground || "42 35 56",
    "--button-primary-dark": c?.buttonBackground || "89 75 122",
    "--button-secondary-dark": c?.buttonBackground || "25 16 62",
    "--hover-background": c?.hoverBackground || tertiary,
    "--text-secondary": c?.textSecondary || secondary,
    "--footer-background": c?.footerBackground || neutral,
    "--inner-footer-background": c?.innerFooterBackground || wash,
  };
}
