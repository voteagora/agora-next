import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
// import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import Tenant from "@/lib/tenant/tenant";
import { fontMapper, inter } from "@/styles/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ForumPermissionsProvider } from "@/contexts/ForumPermissionsContext";

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
  letterSpacing: "0",
};

const defaultFavicons = {
  "apple-touch-icon": "/favicon/apple-touch-icon.png",
  icon32x32: "/favicon/favicon-32x32.png",
  icon16x16: "/favicon/favicon-16x16.png",
  "shortcut-icon": "/favicon/favicon.ico",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const letterSpacing =
    ui?.customization?.letterSpacing || defaults.letterSpacing;
  const font =
    fontMapper[ui?.customization?.font || ""]?.style.fontFamily ||
    inter.style.fontFamily;

  const favicons = {
    appleTouchIcon:
      ui?.favicon?.["apple-touch-icon"] || defaultFavicons["apple-touch-icon"],
    icon32x32: ui?.favicon?.icon32x32 || defaultFavicons["icon32x32"],
    icon16x16: ui?.favicon?.icon16x16 || defaultFavicons["icon16x16"],
    shortcutIcon:
      ui?.favicon?.["shortcut-icon"] || defaultFavicons["shortcut-icon"],
  };

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
    fontFamily: font,
    letterSpacing: letterSpacing,
  } as React.CSSProperties;

  return (
    <html lang="en" style={style}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={favicons.appleTouchIcon}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={favicons.icon32x32}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={favicons.icon16x16}
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <link rel="shortcut icon" href={favicons.shortcutIcon} />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta
          name="msapplication-config"
          content="/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#000" />
      </head>

      <NuqsAdapter>
        <ClientLayout>
          <ForumPermissionsProvider>
            <Header />
            <div className="mx-auto max-w-[1280px] my-3 sm:my-4 px-3 sm:px-8">
              {children}
            </div>
            {/* <DAOMetricsHeader /> */}
          </ForumPermissionsProvider>
        </ClientLayout>
      </NuqsAdapter>
      {ui.googleAnalytics && <GoogleAnalytics gaId={ui.googleAnalytics} />}
    </html>
  );
}
