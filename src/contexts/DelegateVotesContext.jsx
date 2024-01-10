"use client";

import { createContext, useContext, useState } from "react";

const DelegateVotesContext = createContext({
  delegatesVotesSort: "newest",
  setDelegatesVotesSort: (delegatesVotesSort) => {},
  delegateVotes: [],
  setDelegateVotes: (delegateVotes) => {},
  meta: null,
  setMeta: (meta) => {},
});

export function useDelegateVotesContext() {
  return useContext(DelegateVotesContext);
}

const DelegateVotesProvider = ({ children, initialVotes }) => {
  const [delegatesVotesSort, setDelegatesVotesSort] = useState("newest");
  const [delegateVotes, setDelegateVotes] = useState(initialVotes.votes);
  const [meta, setMeta] = useState(initialVotes.meta);

  return (
    <DelegateVotesContext.Provider
      value={{
        delegatesVotesSort,
        setDelegatesVotesSort,
        delegateVotes,
        setDelegateVotes,
        meta,
        setMeta,
      }}
    >
      {children}
    </DelegateVotesContext.Provider>
  );
};

export default DelegateVotesProvider;
