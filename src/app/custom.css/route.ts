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
    font: "TransSansPremium",
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
