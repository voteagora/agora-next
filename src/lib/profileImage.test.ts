import { describe, expect, it } from "vitest";

import { getTwicPicsAvatarUrl } from "./profileImage";

describe("getTwicPicsAvatarUrl", () => {
  it("appends a 2x cover transform for TwicPics-hosted images", () => {
    expect(
      getTwicPicsAvatarUrl(
        "https://agora-x-civic.twic.pics/images/profile-images/0xabc/id.png",
        32
      )
    ).toBe(
      "https://agora-x-civic.twic.pics/images/profile-images/0xabc/id.png?twic=v1%2Fcover%3D64x64"
    );
  });

  it("overwrites an existing twic parameter", () => {
    const url = getTwicPicsAvatarUrl(
      "https://agora-x-civic.twic.pics/images/a.jpg?twic=v1/cover=10x10",
      48
    );
    expect(url).toBe(
      "https://agora-x-civic.twic.pics/images/a.jpg?twic=v1%2Fcover%3D96x96"
    );
  });

  it("leaves non-TwicPics http URLs untouched", () => {
    expect(getTwicPicsAvatarUrl("https://example.com/a.png", 32)).toBe(
      "https://example.com/a.png"
    );
  });

  it("leaves non-http avatar references untouched", () => {
    expect(getTwicPicsAvatarUrl("ipfs://Qm123", 32)).toBe("ipfs://Qm123");
    expect(getTwicPicsAvatarUrl("eip155:1/erc721:0xabc/1", 32)).toBe(
      "eip155:1/erc721:0xabc/1"
    );
    expect(getTwicPicsAvatarUrl("not a url", 32)).toBe("not a url");
  });

  it("returns null for empty input", () => {
    expect(getTwicPicsAvatarUrl(null, 32)).toBeNull();
    expect(getTwicPicsAvatarUrl(undefined, 32)).toBeNull();
    expect(getTwicPicsAvatarUrl("", 32)).toBeNull();
  });
});
