import { describe, expect, it } from "vitest";

import {
  canViewForumSurveyResults,
  getForumSurveyStatus,
} from "./surveyAccess";

const NOW = new Date("2026-07-10T12:00:00.000Z");

describe("getForumSurveyStatus", () => {
  it("keeps a survey open before its deadline", () => {
    expect(
      getForumSurveyStatus(
        {
          closesAt: new Date("2026-07-10T12:00:01.000Z"),
          closedAt: null,
        },
        NOW
      )
    ).toBe("open");
  });

  it("closes at the deadline and never reopens after a manual close", () => {
    expect(getForumSurveyStatus({ closesAt: NOW, closedAt: null }, NOW)).toBe(
      "closed"
    );
    expect(
      getForumSurveyStatus(
        {
          closesAt: new Date("2026-07-11T12:00:00.000Z"),
          closedAt: new Date("2026-07-09T12:00:00.000Z"),
        },
        NOW
      )
    ).toBe("closed");
  });
});

describe("canViewForumSurveyResults", () => {
  it("withholds open results from a non-respondent", () => {
    expect(
      canViewForumSurveyResults("open", {
        hasResponded: false,
        isAuthor: false,
        isModerator: false,
      })
    ).toBe(false);
  });

  it.each([
    { hasResponded: true, isAuthor: false, isModerator: false },
    { hasResponded: false, isAuthor: true, isModerator: false },
    { hasResponded: false, isAuthor: false, isModerator: true },
  ])("shows open results to an authorized viewer", (viewer) => {
    expect(canViewForumSurveyResults("open", viewer)).toBe(true);
  });

  it("makes closed results public", () => {
    expect(
      canViewForumSurveyResults("closed", {
        hasResponded: false,
        isAuthor: false,
        isModerator: false,
      })
    ).toBe(true);
  });
});
