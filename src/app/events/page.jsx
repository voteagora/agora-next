import EventFeed from "../../components/Events/EventFeed";
import AgoraAPI from "../lib/agoraAPI";

// This is the server-side function that fetches events from the Agora API
async function fetchEvents(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/events?page=${page}`);
  return { events: data.events, meta: data.meta };
}

export default async function Page() {
  const events = await fetchEvents();

  return (
    <>
      <section>
        <h1>Activity Feed</h1>
        <EventFeed initialEvents={events} fetchEvents={fetchEvents} />
      </section>
    </>
  );
}
