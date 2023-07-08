"use client";

import EventCard from "./EventCard";

export const EventFeed = ({ events }) => {

  return (
    <div className="mt-6 overflow-hidden border-t border-gray-100">
      {events.map((event) => (
        // eslint-disable-next-line react/jsx-key
        <EventCard event={event} />
      ))}
    </div>
  );
};

export default EventFeed;
