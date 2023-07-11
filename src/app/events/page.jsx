"use client";

import { EventFeed } from "../../components/Events/EventFeed";
import AgoraAPI from "../lib/agoraAPI";
import React from "react";
import Image from "next/image";

async function getEvents(page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/events?page=${page}`);
  return { events: data.events, meta: data.meta };
}

export default function Page() {
  // Set up state for events and pagination meta
  const [events, setEvents] = React.useState([]);
  const [meta, setMeta] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch events when the component mounts and when currentPage changes
  React.useEffect(() => {
    setIsLoading(true);
    getEvents([currentPage])
      .then(({ events, meta }) => {
        setEvents(events);
        setMeta(meta);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch events", error);
        setIsLoading(false);
      });
  }, [currentPage]);

  // Pagination functions
  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
  };

  // If we're still loading, show a loading indicator
  if (isLoading) {
    return (
      <div>
        Loading... <br />
        <Image
          src="/images/blink.gif"
          alt="Blinking Agora Logo"
          width={50}
          height={20}
        />
      </div>
    );
  }
  
  // Otherwise, render the events
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
