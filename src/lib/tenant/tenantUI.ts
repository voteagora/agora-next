type UIToggle = {
  name: string;
  enabled: boolean;
}

type UIPage = {
  description: string;
  route: string;
  title: string;
}

type TenantUIParams = {
  description: string;
  logo: string;
  title: string;
  pages?: UIPage[];
  toggles?: UIToggle[];
}

export class TenantUI {

  private _description: string;
  private _logo: string;
  private _title: string;
  private _pages?: UIPage[];
  private _toggles?: UIToggle[];

  constructor({
                description,
                logo,
                title,
                pages,
                toggles,
              }: TenantUIParams) {
    this._description = description;
    this._logo = logo;
    this._title = title;
    this._toggles = toggles;
    this._pages = pages;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get logo(): string {
    return this._logo;
  }

  public toggle(name: string): UIToggle | undefined {
    return this._toggles?.find(t => t.name === name);
  }

  public page(route: string): UIPage | undefined {
    return this._pages?.find(t => t.route === route);
  }
}