import "@/styles/globals.scss";
import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import Tenant from "@/lib/tenant/tenant";
import { inter } from "@/styles/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";

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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
      </head>
      <ClientLayout>
        <Header />
        {children}
        <DAOMetricsHeader metrics={metrics} />
      </ClientLayout>
      {ui.googleAnalytics && <GoogleAnalytics gaId={ui.googleAnalytics} />}
    </html>
  );
}
