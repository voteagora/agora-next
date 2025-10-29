import Tenant from "@/lib/tenant/tenant";

export async function GET() {
  const { ui } = Tenant.current();

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

  const primary = ui?.customization?.primary || defaults.primary;
  const secondary = ui?.customization?.secondary || defaults.secondary;
  const tertiary = ui?.customization?.tertiary || defaults.tertiary;
  const neutral = ui?.customization?.neutral || defaults.neutral;
  const wash = ui?.customization?.wash || defaults.wash;
  const line = ui?.customization?.line || defaults.line;
  const positive = ui?.customization?.positive || defaults.positive;
  const negative = ui?.customization?.negative || defaults.negative;
  const brandPrimary = ui?.customization?.brandPrimary || defaults.brandPrimary;
  const brandSecondary =
    ui?.customization?.brandSecondary || defaults.brandSecondary;

  const style = {
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
    "--info-section-background":
      ui?.customization?.infoSectionBackground || neutral,
    "--header-background": ui?.customization?.headerBackground || wash,
    "--info-tab-background": ui?.customization?.infoTabBackground || neutral,
    "--button-background": ui?.customization?.buttonBackground || primary,
    "--card-background": ui?.customization?.cardBackground || "255 255 255",
    "--card-border": ui?.customization?.cardBorder || line,
    "--card-background-light":
      ui?.customization?.cardBackground || "255 255 255",
    "--card-background-dark": ui?.customization?.cardBackground || "30 26 47",
    "--hover-background-light":
      ui?.customization?.hoverBackground || "249 250 251",
    "--hover-background-dark": ui?.customization?.hoverBackground || "42 35 56",
    "--modal-background-dark": ui?.customization?.cardBackground || "30 26 47",
    "--input-background-dark": ui?.customization?.cardBackground || "42 35 56",
    "--button-primary-dark": ui?.customization?.buttonBackground || "89 75 122",
    "--button-secondary-dark":
      ui?.customization?.buttonBackground || "25 16 62",
    "--hover-background": ui?.customization?.hoverBackground || tertiary,
    "--text-secondary": ui?.customization?.textSecondary || secondary,
    "--footer-background": ui?.customization?.footerBackground || neutral,
    "--inner-footer-background":
      ui?.customization?.innerFooterBackground || wash,
    "--delegate-card-background": ui?.customization?.delegateCardBg || neutral,
  } as React.CSSProperties;

  const root = `
    :root {
      ${Object.entries(style)
        .map(([key, value]) => `${key}: rgb(${value});`)
        .join("\n")}
    }
  `;

  return new Response(root, {
    status: 200,
    headers: {
      "Content-Type": "text/css",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
