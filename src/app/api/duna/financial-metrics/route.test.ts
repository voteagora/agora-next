import { beforeEach, describe, expect, it, vi } from "vitest";

const daoFinancialMetricsFindManyMock = vi.fn();
const forumTopicFindManyMock = vi.fn();

vi.mock("@/server/db", () => ({
  db: {
    daoFinancialMetrics: {
      findMany: daoFinancialMetricsFindManyMock,
    },
    forumTopic: {
      findMany: forumTopicFindManyMock,
    },
  },
}));

describe("GET /api/duna/financial-metrics", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("filters metrics to revealed financial statement topics before returning the latest two", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-04T00:00:00.000Z"));

    daoFinancialMetricsFindManyMock.mockResolvedValue([
      {
        id: 1,
        dao_slug: "uniswap",
        topic_id: 101,
        year: 2026,
        month: "03",
        data: { TOTAL_ASSETS: 300 },
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
      {
        id: 2,
        dao_slug: "uniswap",
        topic_id: 102,
        year: 2026,
        month: "02",
        data: { TOTAL_ASSETS: 200 },
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      },
      {
        id: 3,
        dao_slug: "uniswap",
        topic_id: 103,
        year: 2026,
        month: "01",
        data: { TOTAL_ASSETS: 100 },
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        id: 4,
        dao_slug: "uniswap",
        topic_id: 104,
        year: 2025,
        month: "12",
        data: { __deleted: true },
        createdAt: new Date("2025-12-01T00:00:00.000Z"),
        updatedAt: new Date("2025-12-01T00:00:00.000Z"),
      },
    ]);
    forumTopicFindManyMock.mockResolvedValue([{ id: 102 }, { id: 103 }]);

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/duna/financial-metrics?daoSlug=uniswap"
      ),
    };

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.metrics.map((metric: { id: number }) => metric.id)).toEqual([
      2, 3,
    ]);
    expect(forumTopicFindManyMock).toHaveBeenCalledWith({
      where: {
        id: { in: [101, 102, 103] },
        dao_slug: "uniswap",
        isFinancialStatement: true,
        OR: [
          { revealTime: null },
          { revealTime: { lte: new Date("2026-05-04T00:00:00.000Z") } },
        ],
      },
      select: {
        id: true,
      },
    });
  });

  it("returns metrics with null topic_id without querying forum topics", async () => {
    daoFinancialMetricsFindManyMock.mockResolvedValue([
      {
        id: 1,
        dao_slug: "uniswap",
        topic_id: null,
        year: 2026,
        month: "03",
        data: { TOTAL_ASSETS: 300 },
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
      {
        id: 2,
        dao_slug: "uniswap",
        topic_id: null,
        year: 2026,
        month: "02",
        data: { TOTAL_ASSETS: 200 },
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      },
    ]);

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/duna/financial-metrics?daoSlug=uniswap"
      ),
    };

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.metrics.map((metric: { id: number }) => metric.id)).toEqual([
      1, 2,
    ]);
    expect(forumTopicFindManyMock).not.toHaveBeenCalled();
  });

  it("mixes null-topic rows with revealed linked rows, preserving sort order", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-04T00:00:00.000Z"));

    daoFinancialMetricsFindManyMock.mockResolvedValue([
      {
        id: 1,
        dao_slug: "uniswap",
        topic_id: 101,
        year: 2026,
        month: "03",
        data: { TOTAL_ASSETS: 300 },
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
      {
        id: 2,
        dao_slug: "uniswap",
        topic_id: null,
        year: 2026,
        month: "02",
        data: { TOTAL_ASSETS: 200 },
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
        updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      },
      {
        id: 3,
        dao_slug: "uniswap",
        topic_id: null,
        year: 2026,
        month: "01",
        data: { TOTAL_ASSETS: 100 },
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]);
    // topic 101 is not yet revealed — only null-topic rows should come through
    forumTopicFindManyMock.mockResolvedValue([]);

    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL(
        "http://localhost/api/duna/financial-metrics?daoSlug=uniswap"
      ),
    };

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.metrics.map((metric: { id: number }) => metric.id)).toEqual([
      2, 3,
    ]);
  });

  it("requires daoSlug", async () => {
    const { GET } = await import("./route");
    const request = {
      nextUrl: new URL("http://localhost/api/duna/financial-metrics"),
    };

    const response = await GET(request as never);

    expect(response.status).toBe(400);
    expect(daoFinancialMetricsFindManyMock).not.toHaveBeenCalled();
  });
});
