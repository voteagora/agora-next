import React from "react";
import { getDelegates } from "../api/delegates/getDelegates";
import DelegateCardList from "../../components/Delegates/DelegateCardList/DelegateCardList";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";

async function fetchDelegates(page = 1, seed) {
  "use server";

  return getDelegates({ page, seed });
}

export default async function Page() {
  const seed = Math.random();
  const delegates = await fetchDelegates();

  return (
    <section>
      <PageHeader headerText="All Delegates" />
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
