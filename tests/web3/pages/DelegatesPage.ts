import { Page, Locator } from "@playwright/test";
import {
  DelegatesLayout,
  delegatesPath,
  getDefaultDelegatesLayout,
} from "../utils/delegatesLayout";

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

    this.gridViewContainer = page.locator(
      '[data-testid="delegates-grid-container"], [data-testid="delegates-grid-view"], .delegates-grid-view'
    );
    this.listViewContainer = page.getByTestId("delegates-list-container");
    this.delegateCards = page.locator('[data-testid="delegate-card"]');
    this.delegateRows = page.locator('[data-testid="delegate-row"]');

    this.vpInfoTooltip = page.locator('[data-testid="vp-tooltip"]');
    this.sevenDayChangeColumn = page.locator('text="7D Change"');
    this.participationColumn = page.locator('text="Participation"');

    this.filterDropdownButton = page.locator('[data-testid="filter-dropdown"]');
    this.searchInput = page.getByPlaceholder(/Exact ENS or address/i);

    this.infoBanner = page.locator('[data-testid="delegates-info-banner"]');
    this.encouragementBanner = page.locator(
      '[data-testid="encouragement-banner"], text="Governance starts with you!"'
    );
  }

  /** Navigate to /delegates; layout defaults to the tenant's configured view. */
  async goto(showDialog = false, layout?: DelegatesLayout) {
    if (!showDialog) {
      await this.page.addInitScript(() => {
        window.sessionStorage.setItem("agora-delegation-dialog-shown", "true");
      });
    }
    await this.page.goto(delegatesPath(layout));
    await this.page.waitForLoadState("domcontentloaded");
  }

  getDefaultLayout(): DelegatesLayout {
    return getDefaultDelegatesLayout();
  }

  async openFilter() {
    await this.filterDropdownButton.click();
  }
}
