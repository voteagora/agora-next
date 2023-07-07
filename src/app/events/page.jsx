"use client";

import { EventFeed } from "../../components/Events/EventFeed";
import AgoraAPI from "../lib/agoraAPI";
import React from "react";

async function getEvents(page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/events?page=${page}`);
  return { events: data.events, meta: data.meta };
}

export default function Page() {
  // Set up state for proposals and meta
  const [events, setEvents] = React.useState([]);
  const [meta, setMeta] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    getEvents([currentPage]).then(({ events, meta }) => {
      setEvents(events);
      setMeta(meta);
    });
  }, [currentPage]);

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
  };

  return (
    <section>
      <h1>Activity Feed</h1>
      <button onClick={goToPreviousPage} disabled={currentPage === 1}>
        Previous Page
      </button>
      <button
        onClick={goToNextPage}
        disabled={currentPage === meta.total_pages}
      >
        Next Page
      </button>
      <EventFeed events={events} />
    </section>
  );
}
