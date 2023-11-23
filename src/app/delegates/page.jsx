import React from "react";
import { getDelegates } from "../api/delegates/getDelegates";
import DelegateCardList from "../../components/Delegates/DelegateCardList";

async function fetchDelegates(page = 1) {
  "use server";

  return getDelegates({ page });
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
