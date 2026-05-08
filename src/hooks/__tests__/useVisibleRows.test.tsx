import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { UIEvent } from "react";
import { useVisibleRows } from "../useVisibleRows";

vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
  return window.setTimeout(() => callback(0), 0);
});
vi.stubGlobal("cancelAnimationFrame", (id: number) => {
  window.clearTimeout(id);
});

function scrollEvent({
  clientHeight = 100,
  scrollHeight = 1000,
  scrollTop,
}: {
  clientHeight?: number;
  scrollHeight?: number;
  scrollTop: number;
}) {
  return {
    currentTarget: {
      clientHeight,
      scrollHeight,
      scrollTop,
    },
  } as UIEvent<HTMLDivElement>;
}

describe("useVisibleRows", () => {
  it("loads another page when the scroll container is near the bottom", () => {
    const { result } = renderHook(() =>
      useVisibleRows({
        pageSize: 20,
        resetKey: "initial",
        totalCount: 100,
      })
    );

    expect(result.current.visibleCount).toBe(20);

    act(() => {
      result.current.handleScroll(scrollEvent({ scrollTop: 700 }));
    });

    expect(result.current.visibleCount).toBe(40);
  });

  it("resets visible rows when the reset key changes", () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) =>
        useVisibleRows({
          pageSize: 20,
          resetKey,
          totalCount: 100,
        }),
      { initialProps: { resetKey: "old" } }
    );

    act(() => {
      result.current.handleScroll(scrollEvent({ scrollTop: 700 }));
    });
    expect(result.current.visibleCount).toBe(40);

    rerender({ resetKey: "new" });

    expect(result.current.visibleCount).toBe(20);
  });

  it("does not load beyond the total row count", () => {
    const { result } = renderHook(() =>
      useVisibleRows({
        pageSize: 20,
        resetKey: "initial",
        totalCount: 25,
      })
    );

    act(() => {
      result.current.handleScroll(scrollEvent({ scrollTop: 700 }));
      result.current.handleScroll(scrollEvent({ scrollTop: 700 }));
    });

    expect(result.current.visibleCount).toBe(25);
  });

  it("does not auto-load when the container has no scrollable overflow", () => {
    const { result } = renderHook(() =>
      useVisibleRows({
        pageSize: 20,
        resetKey: "initial",
        totalCount: 100,
      })
    );

    act(() => {
      result.current.handleScroll(
        scrollEvent({ clientHeight: 1000, scrollHeight: 1000, scrollTop: 0 })
      );
    });

    expect(result.current.visibleCount).toBe(20);
  });
});
