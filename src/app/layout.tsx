import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import Tenant from "@/lib/tenant/tenant";

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
  veil: "rgba(23, 23, 23, 0.3)",
  positive: "#00992B",
  negative: "#C52F00",
  accentPrimary: "#171717",
  accentNeutral: "#FFFFFF",
};

const scroll = {
  primary: "#171717",
  secondary: "#404040",
  tertiary: "#737373",
  neutral: "#FFF8F3",
  wash: "#FAF2E8",
  line: "#F6E5D1",
  veil: "rgba(232, 191, 139, 0.3)",
  positive: "#00992B",
  negative: "#C52F00",
  accentPrimary: "#FF4C00",
  accentNeutral: "#FAF2E8",
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
  const veil = ui?.customization?.veil || defaults.veil;
  const positive = ui?.customization?.positive || defaults.positive;
  const negative = ui?.customization?.negative || defaults.negative;
  const accentPrimary =
    ui?.customization?.accentPrimary || defaults.accentPrimary;
  const accentNeutral =
    ui?.customization?.accentNeutral || defaults.accentNeutral;

  const style = {
    "--primary": primary,
    "--secondary": secondary,
    "--tertiary": tertiary,
    "--neutral": neutral,
    "--wash": wash,
    "--line": line,
    "--veil": veil,
    "--positive": positive,
    "--negative": negative,
    "--accent-primary": accentPrimary,
    "--accent-neutral": accentNeutral,
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
