import { describe, expect, it } from "vitest";
import { buildLinkedinUrl, buildWarpcastUrl } from "./socialLinks";

describe("buildLinkedinUrl", () => {
  it("returns full URLs unchanged", () => {
    expect(buildLinkedinUrl("https://www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
    expect(buildLinkedinUrl("http://linkedin.com/in/jane")).toBe(
      "http://linkedin.com/in/jane"
    );
  });

  it("adds a protocol to linkedin.com URLs", () => {
    expect(buildLinkedinUrl("linkedin.com/in/jane")).toBe(
      "https://linkedin.com/in/jane"
    );
    expect(buildLinkedinUrl("www.linkedin.com/in/jane")).toBe(
      "https://www.linkedin.com/in/jane"
    );
  });

  it("treats bare values as a profile handle", () => {
    expect(buildLinkedinUrl("jane")).toBe("https://www.linkedin.com/in/jane");
    expect(buildLinkedinUrl("@jane")).toBe("https://www.linkedin.com/in/jane");
    expect(buildLinkedinUrl("/jane")).toBe("https://www.linkedin.com/in/jane");
  });

  it("trims whitespace", () => {
    expect(buildLinkedinUrl("  https://www.linkedin.com/in/jane  ")).toBe(
      "https://www.linkedin.com/in/jane"
    );
    expect(buildLinkedinUrl("  jane ")).toBe(
      "https://www.linkedin.com/in/jane"
    );
  });
});

describe("buildWarpcastUrl", () => {
  it("strips @ from the handle", () => {
    expect(buildWarpcastUrl("@jane")).toBe("https://warpcast.com/jane");
    expect(buildWarpcastUrl("jane")).toBe("https://warpcast.com/jane");
  });
});
