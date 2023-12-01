import React from "react";
import { getDelegates } from "../api/delegates/getDelegates";
import DelegateCardList from "../../components/Delegates/DelegateCardList/DelegateCardList";

async function fetchDelegates(page = 1, seed) {
  "use server";

  return getDelegates({ page, seed });
}

export default async function Page() {
  const seed = Math.random();
  const delegates = await fetchDelegates();

  return (
    <section>
      <h1 className="text-xl">Delegates</h1>
      <DelegateCardList
        initialDelegates={delegates}
        fetchDelegates={async (page) => {
          "use server";

          return getDelegates({ page, seed });
        }}
      />
    </section>
  );
}
