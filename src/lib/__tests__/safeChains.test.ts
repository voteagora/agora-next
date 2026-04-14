import { describe, expect, it } from "vitest";
import { linea, lineaSepolia, scroll } from "viem/chains";

import {
  assertSafeProposalFlowSupported,
  getSafeAppChainSegment,
  getSafeTxServiceBaseUrls,
  isSafeProposalFlowSupported,
  UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE,
} from "@/lib/safeChains";

describe("safeChains", () => {
  it("returns centralized Safe tx-service URLs for supported chains", () => {
    expect(getSafeTxServiceBaseUrls(linea.id)).toEqual([
      "https://api.safe.global/tx-service/linea/api/v1",
    ]);
    expect(getSafeTxServiceBaseUrls(scroll.id)).toEqual([
      "https://safe-transaction-scroll.safe.global/api/v1",
      "https://api.safe.global/tx-service/scr/api/v1",
    ]);
  });

  it("returns Safe app segments for chains with queue links", () => {
    expect(getSafeAppChainSegment(linea.id)).toBe("linea");
    expect(getSafeAppChainSegment(scroll.id)).toBe("scr");
  });

  it("marks unsupported Safe proposal-flow chains explicitly", () => {
    expect(isSafeProposalFlowSupported(lineaSepolia.id)).toBe(false);
    expect(getSafeTxServiceBaseUrls(lineaSepolia.id)).toEqual([]);
    expect(getSafeAppChainSegment(lineaSepolia.id)).toBeNull();
    expect(() => assertSafeProposalFlowSupported(lineaSepolia.id)).toThrow(
      UNSUPPORTED_SAFE_PROPOSAL_FLOW_MESSAGE
    );
  });
});
