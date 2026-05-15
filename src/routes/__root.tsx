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
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { inter } from "@/styles/fonts-tanstack";
import Web3ProviderTanstack, {
  shouldHideAgoraBranding,
} from "@/components/providers/Web3ProviderTanstack";
import { DevTenantProvider } from "@/contexts/DevTenantContext";
import { TenantSwitcher } from "@/components/DevTools/TenantSwitcher";
import { ForumPermissionsProvider } from "@/contexts/ForumPermissionsContext";
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

// Default theme values — kept in sync with src/app/layout.tsx.
// Tenant overrides will be wired in when we port Tenant.current() to a
// server-fn-backed root loader (deferred to later in Phase B).
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

const defaultStyle: React.CSSProperties = {
  // RGB triplets consumed via `rgb(var(--primary) / <alpha>)` etc.
  ["--primary" as never]: defaults.primary,
  ["--secondary" as never]: defaults.secondary,
  ["--tertiary" as never]: defaults.tertiary,
  ["--neutral" as never]: defaults.neutral,
  ["--wash" as never]: defaults.wash,
  ["--line" as never]: defaults.line,
  ["--positive" as never]: defaults.positive,
  ["--negative" as never]: defaults.negative,
  ["--brand-primary" as never]: defaults.brandPrimary,
  ["--brand-secondary" as never]: defaults.brandSecondary,
  ["--info-section-background" as never]: defaults.neutral,
  ["--header-background" as never]: defaults.wash,
  ["--info-tab-background" as never]: defaults.neutral,
  ["--button-background" as never]: defaults.primary,
  ["--card-background" as never]: "255 255 255",
  ["--card-border" as never]: defaults.line,
  ["--card-background-light" as never]: "255 255 255",
  ["--card-background-dark" as never]: "30 26 47",
  ["--hover-background-light" as never]: "249 250 251",
  ["--hover-background-dark" as never]: "42 35 56",
  ["--modal-background-dark" as never]: "30 26 47",
  ["--input-background-dark" as never]: "42 35 56",
  ["--button-primary-dark" as never]: "89 75 122",
  ["--button-secondary-dark" as never]: "25 16 62",
  ["--hover-background" as never]: defaults.tertiary,
  ["--text-secondary" as never]: defaults.secondary,
  ["--footer-background" as never]: defaults.neutral,
  ["--inner-footer-background" as never]: defaults.wash,
  fontFamily: inter.style.fontFamily,
  letterSpacing: defaults.letterSpacing,
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Agora" },
      { name: "theme-color", content: "#000" },
    ],
    links: [
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicon/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon/favicon-16x16.png",
      },
      { rel: "manifest", href: "/favicon/site.webmanifest" },
      {
        rel: "mask-icon",
        href: "/favicon/safari-pinned-tab.svg",
        color: "#000000",
      },
      { rel: "shortcut icon", href: "/favicon/favicon.ico" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <NuqsAdapter>
      <RootDocument>
        <DevTenantProvider>
          <Web3ProviderTanstack>
            <ForumPermissionsProvider>
              <Header />
              <div className="mx-auto max-w-[1280px] my-3 sm:my-4 px-3 sm:px-8">
                <RecentlyReleasedBanner />
                <Outlet />
              </div>
              <DAOMetricsHeader />
            </ForumPermissionsProvider>
            <TenantSwitcher />
          </Web3ProviderTanstack>
          {!shouldHideAgoraBranding && <Footer />}
        </DevTenantProvider>
      </RootDocument>
    </NuqsAdapter>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={defaultStyle}>
      <head>
        <HeadContent />
      </head>
      <body className={`${inter.variable} font-inter-var`}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
