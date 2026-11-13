export type ForumSurveyAccessStatus = "open" | "closed";

export function getForumSurveyStatus(
  survey: { closesAt: Date | null; closedAt: Date | null },
  now: Date = new Date()
): ForumSurveyAccessStatus {
  return survey.closedAt || (survey.closesAt && survey.closesAt <= now)
    ? "closed"
    : "open";
}

export function canViewForumSurveyResults(
  status: ForumSurveyAccessStatus,
  viewer: {
    hasResponded: boolean;
    isAuthor: boolean;
    isModerator: boolean;
  }
): boolean {
  return (
    status === "closed" ||
    viewer.hasResponded ||
    viewer.isAuthor ||
    viewer.isModerator
  );
}
