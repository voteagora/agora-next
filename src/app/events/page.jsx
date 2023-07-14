"use client";

import { EventFeed } from "../../components/Events/EventFeed";
import AgoraAPI from "../lib/agoraAPI";
import React, { useState, useEffect } from "react";
import Image from "next/image";

async function getEvents(page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/events?page=${page}`);
  return { events: data.events, meta: data.meta };
}

export default function Page() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getEvents()
      .then(({ events, meta }) => {
        setEvents(events);
        setMeta(meta);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch events", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isPageLoading
      ) {
        return;
      }
      setPageLoading(true);
      getEvents(currentPage + 1).then(
        ({ events: newEvents, meta: newMeta }) => {
          setEvents((prevEvents) => [...prevEvents, ...newEvents]);
          setMeta(newMeta);
          setCurrentPage((prevPage) => prevPage + 1);
          setPageLoading(false);
        }
      );
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, isPageLoading]);

  if (isLoading && events.length === 0) {
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

  return (
    <section>
      <h1>Activity Feed</h1>
      <EventFeed events={events} />
      {isPageLoading && (
        <div>
          Loading... <br />
          <Image
            src="/images/blink.gif"
            alt="Blinking Agora Logo"
            width={50}
            height={20}
          />
        </div>
      )}
    </section>
  );
}
