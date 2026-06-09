import { describe, expect, it } from "vitest";

import { ensTenantUIConfig } from "../ens";
import { optimismTenantUIConfig } from "../optimism";
import { uniswapTenantUIConfig } from "../uniswap";

describe("notification tenant toggles", () => {
  it.each([
    ["ENS", ensTenantUIConfig],
    ["Optimism", optimismTenantUIConfig],
    ["Uniswap", uniswapTenantUIConfig],
  ])("%s enables V2 notifications and not V1 email subscriptions", (_, ui) => {
    expect(ui.toggle("notifications")?.enabled).toBe(true);
    expect(ui.toggle("email-subscriptions")).toBeUndefined();
  });
});
