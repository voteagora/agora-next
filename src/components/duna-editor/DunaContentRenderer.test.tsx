import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DunaContentRenderer from "./DunaContentRenderer";

vi.mock("@/components/ForumShared/Embeds/InternalLinkEmbed", () => ({
  default: ({ originalLink }: { originalLink: any }) => originalLink,
}));

vi.mock("@/components/shared/Markdown/Markdown", () => ({
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {},
    }),
  },
}));

describe("DunaContentRenderer", () => {
  afterEach(() => {
    cleanup();
  });

  it("removes event handlers from raw HTML forum content", () => {
    const { container } = render(
      <DunaContentRenderer content={'<img src="x" onerror="alert(1)">'} />
    );

    const img = container.querySelector("img");

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "x");
    expect(img).not.toHaveAttribute("onerror");
  });

  it("sanitizes encoded HTML before rendering it", () => {
    const { container } = render(
      <DunaContentRenderer content={'&lt;img src="x" onerror="alert(1)"&gt;'} />
    );

    const img = container.querySelector("img");

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "x");
    expect(img).not.toHaveAttribute("onerror");
    expect(container.innerHTML).not.toContain("onerror");
  });
});
