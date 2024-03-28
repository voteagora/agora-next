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

type TenantUIParams = {
  color: string;
  hero?: string;
  logo: string;
  title: string;
  links?: UILink[];
  pages?: UIPage[];
  toggles?: UIToggle[];
};

export class TenantUI {
  private _color: string;
  private _hero?: string;
  private _logo: string;
  private _title: string;
  private _links?: UILink[];
  private _pages?: UIPage[];
  private _toggles?: UIToggle[];

  private _linksCache: { [key: string]: UILink | undefined } = {};
  private _pagesCache: { [key: string]: UIPage | undefined } = {};
  private _togglesCache: { [key: string]: UIToggle | undefined } = {};

  constructor({
    color,
    hero,
    logo,
    title,
    links,
    pages,
    toggles,
  }: TenantUIParams) {
    this._color = color;
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
