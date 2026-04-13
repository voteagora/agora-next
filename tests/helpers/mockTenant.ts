/**
 * Lightweight, Playwright-compatible tenant config reader.
 *
 * Mirrors the subset of TenantUI (links, toggles, pages) and TenantToken
 * (symbol) that the E2E tests need, keyed by NEXT_PUBLIC_AGORA_INSTANCE_NAME.
 *
 * This file intentionally has no imports from src/ so that Playwright's
 * esbuild bundler never tries to resolve SVG / PNG / Next.js-specific assets.
 */

type Link = { name: string; url: string; title: string };
type Toggle = { name: string; enabled: boolean };
type Page = { route: string; href?: string };

type TenantMockConfig = {
  token: { symbol: string };
  links: Link[];
  toggles: Toggle[];
  pages: Page[];
};

function link(name: string, url: string, title: string): Link {
  return { name, url, title };
}

function toggle(name: string, enabled: boolean): Toggle {
  return { name, enabled };
}

function page(route: string, href?: string): Page {
  return { route, ...(href ? { href } : {}) };
}

const configs: Record<string, TenantMockConfig> = {
  optimism: {
    token: { symbol: "OP" },
    links: [
      link("faq", "https://agoraxyz.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c", "FAQ"),
      link("changelog", "/changelog", "Change log"),
      link("discord", "https://discord.gg/vBJkUYBuwX", "Discord"),
      link("bugs", "https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc", "Report bugs & feedback"),
      link("governance-forum", "https://gov.optimism.io/", "Governance Forum"),
    ],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", false),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  ens: {
    token: { symbol: "ENS" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  etherfi: {
    token: { symbol: "ETHFI" },
    links: [
      link("discord", "https://discord.gg/vBJkUYBuwX", "Discord"),
      link("governance-forum", "https://governance.ether.fi/", "Governance Forum"),
    ],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  uniswap: {
    token: { symbol: "UNI" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  cyber: {
    token: { symbol: "cCYBER" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  derive: {
    token: { symbol: "stDRV" },
    links: [link("discord", "https://discord.com/invite/Derive", "Discord")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  scroll: {
    token: { symbol: "SCR" },
    links: [],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  pguild: {
    token: { symbol: "PGUILD" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  boost: {
    token: { symbol: "BGUILD" },
    links: [
      link("changelog", "/changelog", "Change log"),
      link("discord", "https://discord.com/invite/53c3CxDneJ", "Discord"),
    ],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", false),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates")],
  },

  xai: {
    token: { symbol: "vXAI" },
    links: [
      link("changelog", "/changelog", "Change log"),
      link("discord", "https://discord.com/invite/xaigames", "Discord"),
    ],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  b3: {
    token: { symbol: "B3" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  linea: {
    token: { symbol: "LINEA" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", false),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },

  towns: {
    token: { symbol: "TOWNS" },
    links: [
      link("townstwitter", "https://x.com/TownsProtocol", "Twitter"),
      link("townsfarcaster", "https://farcaster.xyz/towns", "Farcaster"),
    ],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", true),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", true),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", true),
    ],
    pages: [page("proposals"), page("delegates"), page("info"), page("coming-soon")],
  },

  syndicate: {
    token: { symbol: "SYNDICATE" },
    links: [],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", true),
      toggle("grants", true),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", true),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info"), page("coming-soon"), page("grants")],
  },

  demo: {
    token: { symbol: "DEMO" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", true),
      toggle("grants", true),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", false),
      toggle("footer/hide-total-supply", false),
      toggle("footer/hide-votable-supply", false),
    ],
    pages: [page("proposals"), page("delegates"), page("info"), page("grants")],
  },

  demo2: {
    token: { symbol: "DEMO" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", true),
      toggle("grants", true),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", true),
      toggle("footer/hide-total-supply", true),
      toggle("footer/hide-votable-supply", true),
    ],
    pages: [page("proposals"), page("delegates"), page("info"), page("grants")],
  },

  demo3: {
    token: { symbol: "DEMO3" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", true),
      toggle("grants", true),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", true),
      toggle("footer/hide-total-supply", true),
      toggle("footer/hide-votable-supply", true),
    ],
    pages: [page("proposals"), page("delegates"), page("info"), page("grants")],
  },

  demo4: {
    token: { symbol: "DEMO4" },
    links: [link("changelog", "/changelog", "Change log")],
    toggles: [
      toggle("proposals", true),
      toggle("delegates", true),
      toggle("info", true),
      toggle("forums", true),
      toggle("grants", false),
      toggle("coming-soon", false),
      toggle("footer/hide-changelog", true),
      toggle("footer/hide-total-supply", true),
      toggle("footer/hide-votable-supply", true),
    ],
    pages: [page("proposals"), page("delegates"), page("info")],
  },
};

/** Mirrors the parts of TenantUI used in E2E tests, without any asset imports. */
export class MockTenantUI {
  constructor(private cfg: TenantMockConfig) {}

  link(name: string): Link | undefined {
    return this.cfg.links.find((l) => l.name === name);
  }

  toggle(name: string): Toggle | undefined {
    return this.cfg.toggles.find((t) => t.name === name);
  }

  page(route: string): Page | undefined {
    return this.cfg.pages.find((p) => p.route === route);
  }
}

/**
 * Returns the mock tenant config for the namespace set in
 * NEXT_PUBLIC_AGORA_INSTANCE_NAME (defaults to "optimism").
 *
 * The playwright.config.ts loads .env.local via loadEnvConfig so this env
 * var is available in test files.
 */
export function getMockTenant(): {
  ui: MockTenantUI;
  token: { symbol: string };
} {
  const namespace =
    process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME ?? "optimism";
  const cfg = configs[namespace];
  if (!cfg) {
    throw new Error(
      `No mock tenant config for namespace "${namespace}". Add it to tests/helpers/mockTenant.ts.`
    );
  }
  return { ui: new MockTenantUI(cfg), token: cfg.token };
}
