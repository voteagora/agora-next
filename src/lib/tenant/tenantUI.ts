type UIToggle = {
  name: string;
  enabled: boolean;
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
  pages?: UIPage[];
  toggles?: UIToggle[];
};

export class TenantUI {
  private _color: string;
  private _hero?: string;
  private _logo: string;
  private _title: string;
  private _pages?: UIPage[];
  private _toggles?: UIToggle[];

  constructor({ color, hero, logo, title, pages, toggles }: TenantUIParams) {
    this._color = color;
    this._hero = hero;
    this._logo = logo;
    this._title = title;
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

  public toggle(name: string): UIToggle | undefined {
    return this._toggles?.find((t) => t.name === name);
  }

  public page(route: string): UIPage | undefined {
    return this._pages?.find((t) => t.route === route);
  }
}
