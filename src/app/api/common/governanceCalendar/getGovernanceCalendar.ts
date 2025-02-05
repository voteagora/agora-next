import Tenant from "@/lib/tenant/tenant";
import { isWithinInterval, format, addDays } from "date-fns";

type ICSEvent = {
  summary: string;
  startDate: Date;
  endDate: Date;
};

type GovernanceCalendar = {
  title: string;
  endDate: string;
  reviewPeriod: boolean;
  votingPeriod: boolean;
} | null;

const parseICSDate = (dateStr: string, timeZone: string): Date => {
  const utcDate = new Date(
    Date.UTC(
      parseInt(dateStr.substring(0, 4), 10), // Year
      parseInt(dateStr.substring(4, 6), 10) - 1, // Month
      parseInt(dateStr.substring(6, 8), 10) // Day
    )
  );

  const zonedDate = new Date(utcDate.toLocaleString("en-US", { timeZone }));

  return zonedDate;
};

const parseICSLine = (line: string): [string, string] | null => {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex === -1) return null;

  const key = line.slice(0, separatorIndex);
  const value = line.slice(separatorIndex + 1);
  return [key, value];
};

const parseICSEvents = (icsContent: string, timeZone: string): ICSEvent[] => {
  const lines = icsContent.split("\n");
  const events: ICSEvent[] = [];
  let currentEvent: Partial<ICSEvent> = {};

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = {};
      continue;
    }

    if (line.startsWith("END:VEVENT")) {
      // Add the event only if it's a voting cycle
      if (
        currentEvent.summary?.includes("Voting Cycle") &&
        currentEvent.startDate &&
        currentEvent.endDate
      ) {
        events.push(currentEvent as ICSEvent);
      }
      currentEvent = {};
      continue;
    }

    const parsedLine = parseICSLine(line);
    if (!parsedLine) continue;

    const [key, value] = parsedLine;

    if (key === "SUMMARY") {
      currentEvent.summary = value;
    } else if (key === "DTSTART;VALUE=DATE") {
      currentEvent.startDate = parseICSDate(value, timeZone);
    } else if (key === "DTEND;VALUE=DATE") {
      currentEvent.endDate = parseICSDate(value, timeZone);
    }
  }

  return events;
};

const findCurrentEvent = (
  events: ICSEvent[],
  now: Date
): GovernanceCalendar => {
  // find any event that contains today
  for (const event of events) {
    if (
      isWithinInterval(now, {
        start: event.startDate,
        end: event.endDate,
      })
    ) {
      const summaryContainsReviewPeriod =
        event.summary.includes("Review Period");
      const summaryContainsVotingPeriod =
        event.summary.includes("Voting Period");
      const dateToUse = summaryContainsReviewPeriod
        ? addDays(event.endDate, 1)
        : event.endDate;

      return {
        title: event.summary,
        endDate: format(dateToUse, "MMMM d"),
        reviewPeriod: summaryContainsReviewPeriod,
        votingPeriod: summaryContainsVotingPeriod,
      };
    }
  }

  return null;
};

export async function fetchGovernanceCalendar() {
  const { ui } = Tenant.current();
  const link = ui.link("calendar");

  if (!link) {
    return null;
  }

  const response = await fetch(link.url, { method: "GET" });
  const icsContent = await response.text();

  // Get user's timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const now = new Date();

  const events = parseICSEvents(icsContent, timeZone);
  return findCurrentEvent(events, now);
}
