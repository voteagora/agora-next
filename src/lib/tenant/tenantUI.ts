import { StaticImageData } from "next/image";
import { icons } from "@/icons/icons";

type UIToggle = {
  name: string;
  enabled: boolean;
};

export type UILink = {
  name: string;
  title: string;
  url: string;
  image?: string | StaticImageData;
};

type UIPage = {
  description: string;
  route: string;
  title: string;
  href?: string;
  links?: UILink[];
  meta: {
    title: string;
    description: string;
    imageTitle: string;
    imageDescription: string;
  };
};

type UIAssets = {
  success: string;
  pending: string;
  delegate: string;
};

type UIDelegates = {
  allowed: `0x${string}`[];
  advanced: `0x${string}`[];
  retired: `0x${string}`[];
};

type UIGovernanceIssue = {
  icon: keyof typeof icons;
  key: string;
  title: string;
};

type UIGovernanceStakeholder = {
  key: string;
  title: string;
};

type UIOrganization = {
  title: string;
};

type TenantUIParams = {
  assets: UIAssets;
  delegates?: UIDelegates;
  googleAnalytics?: string;
  governanceIssues?: UIGovernanceIssue[];
  governanceStakeholders?: UIGovernanceStakeholder[];
  hero?: string;
  links?: UILink[];
  logo: string;
  organization?: UIOrganization;
  pages?: UIPage[];
  title: string;
  toggles?: UIToggle[];
  customization?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    neutral?: string;
    wash?: string;
    line?: string;
    positive?: string;
    negative?: string;
    brandPrimary?: string;
    brandSecondary?: string;
    font?: string;
  };
};

export class TenantUI {
  private _assets: UIAssets;
  private _delegates?: UIDelegates;
  private _googleAnalytics?: string;
  private _governanceIssues?: UIGovernanceIssue[];
  private _governanceStakeholders?: UIGovernanceStakeholder[];
  private _hero?: string;
  private _links?: UILink[];
  private _logo: string;
  private _organization?: UIOrganization;
  private _pages?: UIPage[];
  private _title: string;
  private _toggles?: UIToggle[];
  private _customization?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    neutral?: string;
    wash?: string;
    line?: string;
    positive?: string;
    negative?: string;
    brandPrimary?: string;
    brandSecondary?: string;
    font?: string;
  };
  private _linksCache: { [key: string]: UILink | undefined } = {};
  private _pagesCache: { [key: string]: UIPage | undefined } = {};
  private _togglesCache: { [key: string]: UIToggle | undefined } = {};

  constructor({
    assets,
    customization,
    delegates,
    googleAnalytics,
    governanceIssues,
    governanceStakeholders,
    hero,
    links,
    logo,
    organization,
    pages,
    title,
    toggles,
  }: TenantUIParams) {
    this._assets = assets;
    this._customization = customization;
    this._delegates = delegates;
    this._googleAnalytics = googleAnalytics;
    this._governanceIssues = governanceIssues;
    this._governanceStakeholders = governanceStakeholders;
    this._hero = hero;
    this._links = links;
    this._logo = logo;
    this._organization = organization;
    this._pages = pages;
    this._title = title;
    this._toggles = toggles;
  }

  public get assets(): UIAssets {
    return this._assets;
  }

  public get delegates(): UIDelegates | undefined {
    return this._delegates;
  }

  public get governanceIssues(): UIGovernanceIssue[] | undefined {
    return this._governanceIssues;
  }

  public get governanceStakeholders(): UIGovernanceStakeholder[] | undefined {
    return this._governanceStakeholders;
  }

  public get googleAnalytics(): string | undefined {
    return this._googleAnalytics;
  }

  public get title(): string {
    return this._title;
  }

  public get hero(): string | undefined {
    return this._hero;
  }

  public get logo(): string {
    return this._logo;
  }

  public get organization(): UIOrganization | undefined {
    return this._organization;
  }

  public get customization():
    | {
        primary?: string;
        secondary?: string;
        tertiary?: string;
        neutral?: string;
        wash?: string;
        line?: string;
        positive?: string;
        negative?: string;
        brandPrimary?: string;
        brandSecondary?: string;
        font?: string;
      }
    | undefined {
    return this._customization;
  }

  public link(name: string): UILink | undefined {
    if (this._linksCache[name] !== undefined) {
      return this._linksCache[name];
    }

    const result = this._links?.find((t) => t.name === name);
    this._linksCache[name] = result;
    return result;
  }

  public toggle(name: string): UIToggle | undefined {
    if (this._togglesCache[name] !== undefined) {
      return this._togglesCache[name];
    }

    const result = this._toggles?.find((t) => t.name === name);
    this._togglesCache[name] = result;
    return result;
  }

  public page(route: string): UIPage | undefined {
    if (this._pagesCache[route] !== undefined) {
      return this._pagesCache[route];
    }

    const result = this._pages?.find((t) => t.route === route);
    this._pagesCache[route] = result;
    return result;
  }
}
