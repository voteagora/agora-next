type UIToggle = {
  name: string;
  enabled: boolean;
};

type UILink = {
  name: string;
  title: string;
  url: string;
};

type UIPage = {
  description: string;
  route: string;
  title: string;
  meta: {
    title: string;
    description: string;
  };
};

type UIDelegates = {
  advanced: `0x${string}`[];
  retired: `0x${string}`[];
};

type TenantUIParams = {
  color: string;
  delegates?: UIDelegates;
  hero?: string;
  logo: string;
  title: string;
  links?: UILink[];
  pages?: UIPage[];
  toggles?: UIToggle[];
};

export class TenantUI {
  private _color: string;
  private _delegates?: UIDelegates;
  private _hero?: string;
  private _links?: UILink[];
  private _logo: string;
  private _pages?: UIPage[];
  private _title: string;
  private _toggles?: UIToggle[];

  private _linksCache: { [key: string]: UILink | undefined } = {};
  private _pagesCache: { [key: string]: UIPage | undefined } = {};
  private _togglesCache: { [key: string]: UIToggle | undefined } = {};

  constructor({
    color,
    delegates,
    hero,
    logo,
    title,
    links,
    pages,
    toggles,
  }: TenantUIParams) {
    this._color = color;
    this._delegates = delegates;
    this._hero = hero;
    this._logo = logo;
    this._title = title;
    this._links = links;
    this._toggles = toggles;
    this._pages = pages;
  }

  public get color(): string {
    return this._color;
  }

  public get delegates(): UIDelegates | undefined {
    return this._delegates;
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
