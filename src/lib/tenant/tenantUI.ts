import { StaticImageData } from "next/image";
import { icons } from "@/icons/icons";
import { PLMConfig } from "@/app/proposals/draft/types";
import { TenantToken } from "../types";
import React, { ReactNode } from "react";

type UIToggle = {
  name: string;
  enabled: boolean;
  config?: UIConfig | UIEndorsedConfig | UIGasRelayConfig;
};

export type UIEndorsedConfig = {
  tooltip: string;
  showFilterLabel: string;
  hideFilterLabel: string;
  defaultFilter: boolean;
};

export type UIGasRelayConfig = {
  signature?: {
    version?: string;
  };
  minBalance: string;
  sponsorAddress: `0x${string}`;
  minVPToUseGasRelay: string;
};

// UI config exists to give tenant specifc config options to a UI toggle
// the canonical example is wanting to allow tenants to customize
// their proposal lifecycle feature
export type UIDunaDescriptionConfig = {
  content: ReactNode;
};

export type UIVotingPowerInfoConfig = {
  text: string;
};

export type UIGovernanceInfoSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type UIGovernanceInfoConfig = {
  title?: string;
  sections: UIGovernanceInfoSection[];
};

export type UIInfoBannerConfig = {
  text: string;
  link: string;
  storageKey: string;
};

export type UIDunaDisclosuresConfig = {
  content: ReactNode;
  disclaimer?: ReactNode;
};

export type UITaxFormConfig = {
  payeeFormUrl?: string;
  provider?: string;
};

export type UIFinancialStatementsConfig = {
  title: string;
};

type UIConfig =
  | PLMConfig
  | UIDunaDescriptionConfig
  | UIVotingPowerInfoConfig
  | UIGovernanceInfoConfig
  | UIInfoBannerConfig
  | UIDunaDisclosuresConfig
  | UITaxFormConfig
  | UIFinancialStatementsConfig;

// Note: Modular accounts are not yet supported
// https://accountkit.alchemy.com/smart-contracts/light-account
export type UISmartAccountConfig = {
  bundlerUrl: string;
  entryPointAddress: `0x${string}`;
  factoryAddress: `0x${string}`;
  paymasterAddress: `0x${string}`;
  paymasterUrl: string;
  salt: bigint;
  type: "LightAccount";
  version: "v1.1.0" | "v2.0.0";
};

export type UILink = {
  name: string;
  title: string;
  url: string;
  image?: string | StaticImageData;
};

type UIPage = {
  description: string | React.ReactNode;
  hero?: StaticImageData | string;
  href?: string;
  links?: UILink[];
  route: string;
  title: string;
  sectionTitle?: string;
  tabs?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string | React.ReactNode;
  }>;
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
  failed?: string; //TODO: make this required for all tenants
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
  hideAgoraBranding?: boolean;
  links?: UILink[];
  logo: string;
  logoSize?: string;
  organization?: UIOrganization;
  pages?: UIPage[];
  smartAccountConfig?: UISmartAccountConfig;
  title: string;
  toggles?: UIToggle[];
  tokens?: TenantToken[];
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
    tokenAmountFont?: string;
    letterSpacing?: string;
    infoSectionBackground?: string;
    headerBackground?: string;
    infoTabBackground?: string;
    buttonBackground?: string;
    cardBackground?: string;
    cardBorder?: string;
    hoverBackground?: string;
    textSecondary?: string;
    footerBackground?: string;
    innerFooterBackground?: string;
    customHeroImageSize?: string;
    customInfoTabs?: Array<{ title: string; description: string }>;
    customIconBackground?: string;
    customInfoLayout?: string;
    customTextContainer?: string;
    customAboutSubtitle?: string;
    customTitleSize?: string;
    customCardSize?: string;
    customIconColor?: string;
    noReportsFound?: string;
    customButtonBackground?: string;
    customHeroTitleWidth?: string;
    tagBackground?: string;
    infoBannerBackground?: string;
  };
  theme?: "light" | "dark";
  favicon?: {
    "apple-touch-icon"?: string;
    icon32x32?: string;
    icon16x16?: string;
    "shortcut-icon"?: string;
  };
  tacticalStrings?: {
    myBalance?: string;
  };
  dunaDisclaimers?: string;
  documentColors?: string[];
};

export class TenantUI {
  private _assets: UIAssets;
  private _delegates?: UIDelegates;
  private _googleAnalytics?: string;
  private _governanceIssues?: UIGovernanceIssue[];
  private _governanceStakeholders?: UIGovernanceStakeholder[];
  private _hideAgoraBranding?: boolean;
  private _links?: UILink[];
  private _logo: string;
  private _logoSize?: string;
  private _organization?: UIOrganization;
  private _pages?: UIPage[];
  private _title: string;
  private _toggles?: UIToggle[];
  private _tokens?: TenantToken[];
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
    tokenAmountFont?: string;
    letterSpacing?: string;
    infoSectionBackground?: string;
    headerBackground?: string;
    infoTabBackground?: string;
    buttonBackground?: string;
    cardBackground?: string;
    cardBorder?: string;
    hoverBackground?: string;
    textSecondary?: string;
    footerBackground?: string;
    innerFooterBackground?: string;
    customHeroImageSize?: string;
    customInfoTabs?: Array<{ title: string; description: string }>;
    customIconBackground?: string;
    customInfoLayout?: string;
    customTextContainer?: string;
    customAboutSubtitle?: string;
    customTitleSize?: string;
    customCardSize?: string;
    customIconColor?: string;
    noReportsFound?: string;
    customButtonBackground?: string;
    customHeroTitleWidth?: string;
    tagBackground?: string;
    infoBannerBackground?: string;
  };
  private _theme: "light" | "dark";
  private _favicon?: {
    "apple-touch-icon"?: string;
    icon32x32?: string;
    icon16x16?: string;
    "shortcut-icon"?: string;
  };
  private _linksCache: { [key: string]: UILink | undefined } = {};
  private _pagesCache: { [key: string]: UIPage | undefined } = {};
  private _togglesCache: { [key: string]: UIToggle | undefined } = {};

  private _smartAccountConfig?: UISmartAccountConfig;
  private _tacticalStrings?: {
    myBalance?: string;
  };
  private _dunaDisclaimers?: string;
  private _documentColors?: string[];

  constructor({
    assets,
    customization,
    delegates,
    documentColors,
    dunaDisclaimers,
    favicon,
    googleAnalytics,
    governanceIssues,
    governanceStakeholders,
    hideAgoraBranding,
    links,
    logo,
    logoSize,
    organization,
    pages,
    smartAccountConfig,
    title,
    toggles,
    tacticalStrings,
    theme,
    tokens,
  }: TenantUIParams) {
    this._assets = assets;
    this._customization = customization;
    this._delegates = delegates;
    this._documentColors = documentColors;
    this._dunaDisclaimers = dunaDisclaimers;
    this._favicon = favicon;
    this._googleAnalytics = googleAnalytics;
    this._governanceIssues = governanceIssues;
    this._governanceStakeholders = governanceStakeholders;
    this._hideAgoraBranding = hideAgoraBranding;
    this._links = links;
    this._logo = logo;
    this._logoSize = logoSize;
    this._organization = organization;
    this._pages = pages;
    this._smartAccountConfig = smartAccountConfig;
    this._title = title;
    this._toggles = toggles;
    this._tacticalStrings = tacticalStrings;
    this._theme = theme ?? "light";
    this._tokens = tokens;
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

  public get hideAgoraBranding(): boolean {
    return this._hideAgoraBranding || false;
  }

  public get googleAnalytics(): string | undefined {
    return this._googleAnalytics;
  }

  public get title(): string {
    return this._title;
  }

  public get logo(): string {
    return this._logo;
  }

  public get logoSize(): string | undefined {
    return this._logoSize;
  }

  public get organization(): UIOrganization | undefined {
    return this._organization;
  }

  public get tokens(): TenantToken[] | undefined {
    return this._tokens;
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
        tokenAmountFont?: string;
        letterSpacing?: string;
        infoSectionBackground?: string;
        headerBackground?: string;
        infoTabBackground?: string;
        buttonBackground?: string;
        cardBackground?: string;
        cardBorder?: string;
        hoverBackground?: string;
        textSecondary?: string;
        footerBackground?: string;
        innerFooterBackground?: string;
        customHeroImageSize?: string;
        customInfoTabs?: Array<{ title: string; description: string }>;
        customIconBackground?: string;
        customInfoLayout?: string;
        customTextContainer?: string;
        customAboutSubtitle?: string;
        customTitleSize?: string;
        customCardSize?: string;
        customIconColor?: string;
        noReportsFound?: string;
        customButtonBackground?: string;
        tagBackground?: string;
        infoBannerBackground?: string;
      }
    | undefined {
    return this._customization;
  }

  public get theme(): "light" | "dark" {
    return this._theme;
  }

  public get favicon():
    | {
        "apple-touch-icon"?: string;
        icon32x32?: string;
        icon16x16?: string;
        "shortcut-icon"?: string;
      }
    | undefined {
    return this._favicon;
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

  public get smartAccountConfig(): UISmartAccountConfig | undefined {
    return this._smartAccountConfig;
  }

  public get tacticalStrings():
    | {
        myBalance?: string;
      }
    | undefined {
    return this._tacticalStrings;
  }

  public get dunaDisclaimers(): string | undefined {
    return this._dunaDisclaimers;
  }

  public get documentColors(): string[] | undefined {
    return this._documentColors;
  }
}
