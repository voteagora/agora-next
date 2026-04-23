import { Page, Locator } from "@playwright/test";

export class DelegatesPage {
  readonly page: Page;

  // Delegates List Page (DEL-LIST-*)
  readonly gridViewContainer: Locator;
  readonly listViewContainer: Locator;
  readonly delegateCards: Locator;
  readonly delegateRows: Locator;
  readonly vpInfoTooltip: Locator;
  readonly sevenDayChangeColumn: Locator;
  readonly participationColumn: Locator;
  readonly filterDropdownButton: Locator;
  readonly searchInput: Locator;
  readonly infoBanner: Locator;
  readonly encouragementBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Selectors usually mapped to data-testid or strong structural classes in Agora
    this.gridViewContainer = page.locator(
      '[data-testid="delegates-grid-view"], .grid'
    );
    this.listViewContainer = page.locator(
      '[data-testid="delegates-list-view"], table'
    );
    this.delegateCards = page.locator('[data-testid="delegate-card"]');
    this.delegateRows = page.locator('[data-testid="delegate-row"]');

    this.vpInfoTooltip = page.locator('[data-testid="vp-tooltip"]');
    this.sevenDayChangeColumn = page.locator('text="7D Change"');
    this.participationColumn = page.locator('text="Participation"');

    this.filterDropdownButton = page.locator('[data-testid="filter-dropdown"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');

    this.infoBanner = page.locator('[data-testid="delegates-info-banner"]');
    this.encouragementBanner = page.locator(
      '[data-testid="encouragement-banner"], text="Governance starts with you!"'
    );
  }

  async goto(showDialog = false) {
    if (!showDialog) {
      await this.page.addInitScript(() => {
        window.sessionStorage.setItem("agora-delegation-dialog-shown", "true");
      });
    }
    await this.page.goto("/delegates");
  }

  async openFilter() {
    await this.filterDropdownButton.click();
  }
}
