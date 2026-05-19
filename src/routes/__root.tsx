/// <reference types="vite/client" />
import "@/styles/globals.scss";
import "@/styles/fonts.css";

import type { ReactNode } from "react";
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { inter, fontMapper } from "@/styles/fonts-tanstack";
import Tenant from "@/lib/tenant/tenant";
import Web3ProviderTanstack, {
  shouldHideAgoraBranding,
} from "@/components/providers/Web3ProviderTanstack";
import { DevTenantProvider } from "@/contexts/DevTenantContext";
import { TenantSwitcher } from "@/components/DevTools/TenantSwitcher";
import { ForumPermissionsProvider } from "@/contexts/ForumPermissionsContext";
import { ForumSubscriptionsProvider } from "@/contexts/ForumSubscriptionsContext";
import Header from "@/components/Header/Header";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";
import Footer from "@/components/Footer";
import RecentlyReleasedBanner from "@/components/shared/RecentlyReleasedBanner";

// Mirror the BigInt prototype patch from src/app/layout.tsx so that
// serialization in API responses + server-fn payloads matches the Next build.
declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

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
  letterSpacing: "0",
} as const;

const defaultFavicons = {
  appleTouchIcon: "/favicon/apple-touch-icon.png",
  icon32x32: "/favicon/favicon-32x32.png",
  icon16x16: "/favicon/favicon-16x16.png",
  shortcutIcon: "/favicon/favicon.ico",
};

const fetchTenantTheme = createServerFn({ method: "GET" }).handler(() => {
  const { ui } = Tenant.current();
  return {
    customization: ui.customization ?? null,
    theme: ui.theme,
    favicon: ui.favicon ?? null,
    googleAnalytics: ui.googleAnalytics ?? null,
  };
});

function buildStyle(
  c: Record<string, string | undefined> | null | undefined
): React.CSSProperties {
  const primary = c?.primary || defaults.primary;
  const secondary = c?.secondary || defaults.secondary;
  const tertiary = c?.tertiary || defaults.tertiary;
  const neutral = c?.neutral || defaults.neutral;
  const wash = c?.wash || defaults.wash;
  const line = c?.line || defaults.line;
  const positive = c?.positive || defaults.positive;
  const negative = c?.negative || defaults.negative;
  const brandPrimary = c?.brandPrimary || defaults.brandPrimary;
  const brandSecondary = c?.brandSecondary || defaults.brandSecondary;
  const letterSpacing = c?.letterSpacing || defaults.letterSpacing;
  const font =
    fontMapper[c?.font || ""]?.style.fontFamily || inter.style.fontFamily;

  return {
    ["--primary" as never]: primary,
    ["--secondary" as never]: secondary,
    ["--tertiary" as never]: tertiary,
    ["--neutral" as never]: neutral,
    ["--wash" as never]: wash,
    ["--line" as never]: line,
    ["--positive" as never]: positive,
    ["--negative" as never]: negative,
    ["--brand-primary" as never]: brandPrimary,
    ["--brand-secondary" as never]: brandSecondary,
    ["--info-section-background" as never]: c?.infoSectionBackground || neutral,
    ["--header-background" as never]: c?.headerBackground || wash,
    ["--info-tab-background" as never]: c?.infoTabBackground || neutral,
    ["--button-background" as never]: c?.buttonBackground || primary,
    ["--card-background" as never]: c?.cardBackground || "255 255 255",
    ["--card-border" as never]: c?.cardBorder || line,
    ["--card-background-light" as never]: c?.cardBackground || "255 255 255",
    ["--card-background-dark" as never]: c?.cardBackground || "30 26 47",
    ["--hover-background-light" as never]: c?.hoverBackground || "249 250 251",
    ["--hover-background-dark" as never]: c?.hoverBackground || "42 35 56",
    ["--modal-background-dark" as never]: c?.cardBackground || "30 26 47",
    ["--input-background-dark" as never]: c?.cardBackground || "42 35 56",
    ["--button-primary-dark" as never]: c?.buttonBackground || "89 75 122",
    ["--button-secondary-dark" as never]: c?.buttonBackground || "25 16 62",
    ["--hover-background" as never]: c?.hoverBackground || tertiary,
    ["--text-secondary" as never]: c?.textSecondary || secondary,
    ["--footer-background" as never]: c?.footerBackground || neutral,
    ["--inner-footer-background" as never]: c?.innerFooterBackground || wash,
    fontFamily: font,
    letterSpacing,
  } as React.CSSProperties;
}

export const Route = createRootRoute({
  loader: () => fetchTenantTheme(),
  head: ({ loaderData }) => {
    const d = loaderData as
      | Awaited<ReturnType<typeof fetchTenantTheme>>
      | undefined;
    const favicon = d?.favicon;
    const gaId = d?.googleAnalytics;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Agora" },
        { name: "theme-color", content: "#000" },
        { name: "msapplication-TileColor", content: "#000000" },
        { name: "msapplication-config", content: "/favicon/browserconfig.xml" },
      ],
      links: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: favicon?.["apple-touch-icon"] || defaultFavicons.appleTouchIcon,
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: favicon?.icon32x32 || defaultFavicons.icon32x32,
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: favicon?.icon16x16 || defaultFavicons.icon16x16,
        },
        { rel: "manifest", href: "/favicon/site.webmanifest" },
        {
          rel: "mask-icon",
          href: "/favicon/safari-pinned-tab.svg",
          color: "#000000",
        },
        {
          rel: "shortcut icon",
          href: favicon?.["shortcut-icon"] || defaultFavicons.shortcutIcon,
        },
      ],
      scripts: gaId
        ? [
            {
              src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
              async: true,
            },
            {
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`,
            },
          ]
        : [],
    };
  },
  component: RootComponent,
});

function RootComponent() {
  const loaderData = Route.useLoaderData() as
    | Awaited<ReturnType<typeof fetchTenantTheme>>
    | undefined;

  const style = buildStyle(
    loaderData?.customization as Record<string, string | undefined> | null
  );
  const isDark = loaderData?.theme === "dark";
  const fontVarClass =
    fontMapper[loaderData?.customization?.font || ""]?.variable ||
    inter.variable;

  return (
    <NuqsAdapter>
      <RootDocument style={style} isDark={isDark} fontVarClass={fontVarClass}>
        <DevTenantProvider>
          <Web3ProviderTanstack>
            <ForumPermissionsProvider>
              <ForumSubscriptionsProvider>
                <Header />
                <div className="mx-auto max-w-[1280px] my-3 sm:my-4 px-3 sm:px-8">
                  <RecentlyReleasedBanner />
                  <Outlet />
                </div>
                <DAOMetricsHeader />
              </ForumSubscriptionsProvider>
            </ForumPermissionsProvider>
            <TenantSwitcher />
          </Web3ProviderTanstack>
          {!shouldHideAgoraBranding && <Footer />}
        </DevTenantProvider>
      </RootDocument>
    </NuqsAdapter>
  );
}

function RootDocument({
  children,
  style,
  isDark,
  fontVarClass,
}: Readonly<{
  children: ReactNode;
  style: React.CSSProperties;
  isDark: boolean;
  fontVarClass: string;
}>) {
  return (
    <html lang="en" style={style} className={isDark ? "dark" : ""}>
      <head>
        <HeadContent />
      </head>
      <body className={`${fontVarClass} font-inter-var`}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
