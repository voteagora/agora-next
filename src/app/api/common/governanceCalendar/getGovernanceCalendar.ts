type Event = {
    SUMMARY: string;
    ["DTSTART;VALUE=DATE"]: string;
    ["DTEND;VALUE=DATE"]: string;
};

const parseICSDates = (_startDate: string, _endDate: string) => {
    const startDateTrim = _startDate.trim();
    const endDateTrim = _endDate.trim();

    const startDate = new Date(
        parseInt(startDateTrim.substring(0, 4), 10), // Year
        parseInt(startDateTrim.substring(4, 6), 10) - 1, // Month
        parseInt(startDateTrim.substring(6, 8), 10) // Day
    );

    const endDate = new Date(
        parseInt(endDateTrim.substring(0, 4), 10), // Year
        parseInt(endDateTrim.substring(4, 6), 10) - 1, // Month
        parseInt(endDateTrim.substring(6, 8), 10) // Day
    );

    return {
        startDate,
        endDate,
    };
};

const isCurrentEvent = (startDate: Date, endDate: Date) => {
    const now = new Date();
    return now >= startDate && now <= endDate;
};

function parseICS(icsData: string) {
    const lines = icsData.split("\n");
    let event;
    let currentEvent: Event | object = {};

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("BEGIN:VEVENT")) {
            currentEvent = {};
        } else if (lines[i].startsWith("END:VEVENT")) {
            /**
             * Check if today's date is between events date and it has the text "Voting Cycle", we only need one event,
             * so in case we find it there is no need to loop more
             */
            if ((currentEvent as Event).SUMMARY.includes("Voting Cycle")) {
                const { startDate, endDate } = parseICSDates(
                    (currentEvent as Event)["DTSTART;VALUE=DATE"],
                    (currentEvent as Event)["DTEND;VALUE=DATE"]
                );
                if (isCurrentEvent(startDate, endDate)) {
                    event = {
                        title: (currentEvent as Event).SUMMARY.trim(),
                        endDate
                    };
                    currentEvent = {};
                    break;
                } else {
                    currentEvent = {};
                }
            } else {
                currentEvent = {};
            }
        } else if (currentEvent) {
            const [key, value] = lines[i].split(":");
            (currentEvent as Event)[key as keyof Event] = value;
        }
    }

    return event;
}

export async function getGovernanceCalendar() {
    const response = await fetch(
        `https://calendar.google.com/calendar/ical/c_fnmtguh6noo6qgbni2gperid4k%40group.calendar.google.com/public/basic.ics`,
        {
            method: "GET"
        }
    );
    const calendarICS = await response.text();
    return parseICS(calendarICS);
}
