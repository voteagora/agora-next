import "@/styles/globals.scss";
import ClientLayout from "./Web3Provider";
import Header from "@/components/Header/Header";
import { fetchMetrics } from "@/app/api/common/metrics/getMetrics";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import Tenant from "@/lib/tenant/tenant";
import { fontMapper, inter } from "@/styles/fonts";
import {
  buildTenantCssVars,
  CSS_VAR_DEFAULTS,
} from "@/lib/tenant/tenantCssVars";
import { GoogleAnalytics } from "@next/third-parties/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ForumPermissionsProvider } from "@/contexts/ForumPermissionsContext";
import RecentlyReleasedBanner from "@/components/shared/RecentlyReleasedBanner";
import { DevTenantProvider } from "@/contexts/DevTenantContext";
import { TenantSwitcher } from "@/components/DevTools/TenantSwitcher";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
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
  const miradorWebApiKey = process.env.MIRADOR_WEB_API_KEY;

  const letterSpacing =
    ui?.customization?.letterSpacing || CSS_VAR_DEFAULTS.letterSpacing;
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
    ...buildTenantCssVars(ui?.customization),
    fontFamily: font,
    letterSpacing: letterSpacing,
  } as React.CSSProperties;

  return (
    <html lang="en" style={style} className={ui.theme === "dark" ? "dark" : ""}>
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
        <DevTenantProvider>
          <ClientLayout miradorWebApiKey={miradorWebApiKey}>
            <ForumPermissionsProvider>
              <Header />
              <div className="mx-auto max-w-[1280px] my-3 sm:my-4 px-3 sm:px-8">
                <RecentlyReleasedBanner />
                {children}
              </div>
              <DAOMetricsHeader />
            </ForumPermissionsProvider>
            <TenantSwitcher />
          </ClientLayout>
        </DevTenantProvider>
      </NuqsAdapter>
      {ui.googleAnalytics && <GoogleAnalytics gaId={ui.googleAnalytics} />}
    </html>
  );
}
