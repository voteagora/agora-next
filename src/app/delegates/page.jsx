"use client";
import AgoraAPI from "@/app/lib/agoraAPI";
import React from "react";
import AgoraSuspense from "@/components/shared/AgoraSuspense";

import { DelegateCardList } from "../../components/Delegates/DelegateCardList";

async function getDelegates(page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/delegates?page=${page}`);
  return { delegates: data.delegates, meta: data.meta };
}

export default function Page() {
  const [delegates, setDelegates] = React.useState([]);
  const [meta, setMeta] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    getDelegates([currentPage]).then(({ delegates, meta }) => {
      setDelegates(delegates);
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
      <h1 className="text-xl">Delegates</h1>
      <AgoraSuspense>
        <DelegateCardList delegateList={delegates} />
      </AgoraSuspense>
      <button onClick={goToPreviousPage} disabled={currentPage === 1}>
        Previous Page
      </button>
      <button
        onClick={goToNextPage}
        disabled={currentPage === meta.total_pages}
      >
        Next Page
      </button>
    </section>
  );
}
