import AgoraAPI from "@/app/lib/agoraAPI";
import React from "react";

import DelegateCardList from "../../components/Delegates/DelegateCardList";

async function fetchDelegates(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/delegates?page=${page}`);
  return { delegates: data.delegates, meta: data.meta };
}

export default async function Page() {
  const delegates = await fetchDelegates();

  return (
    <section>
      <h1 className="text-xl">Delegates</h1>
      <DelegateCardList
        initialDelegates={delegates}
        fetchDelegates={fetchDelegates}
      />
    </section>
  );
}
