import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import Tenant from "@/lib/tenant/tenant";
import { inter } from "@/styles/fonts";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

async function fetchDaoMetrics() {
  "use server";
  return fetchMetrics();
}

const standard = {
  primary: "#171717",
  secondary: "#404040",
  tertiary: "#737373",
  neutral: "#FFFFFF",
  wash: "#FAFAFA",
  line: "#EAEAEA",
  positive: "#00992B",
  negative: "#C52F00",
  brandPrimary: "#171717",
  brandSecondary: "#FFFFFF",
};

const defaults = standard;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metrics = await fetchDaoMetrics();
  const { ui } = Tenant.current();

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
  const font = ui?.customization?.font || inter.style.fontFamily;

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
    "font-family": font,
  } as React.CSSProperties;

  return (
    <html lang="en" style={style}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <ClientLayout>
        <Header />
        {children}
        <DAOMetricsHeader metrics={metrics} />
      </ClientLayout>
    </html>
  );
}
