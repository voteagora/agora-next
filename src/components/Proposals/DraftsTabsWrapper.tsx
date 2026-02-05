"use client";

import { useState, useCallback } from "react";
import { ProposalsTabsClient } from "./ProposalsTabsClient";
import MyDraftProposals from "./DraftProposals/MyDraftProposals";
import MySponsorshipRequests from "./DraftProposals/MySponsorshipRequests";

export function DraftsTabsWrapper({
  children,
  fetchDraftProposals,
  fetchSponsorshipProposals,
  plmEnabled,
}: {
  children: React.ReactNode;
  fetchDraftProposals: (address: `0x${string}`) => Promise<any[]>;
  fetchSponsorshipProposals: (address: `0x${string}`) => Promise<any[]>;
  plmEnabled: boolean;
}) {
  const [draftCount, setDraftCount] = useState(0);
  const [sponsorshipCount, setSponsorshipCount] = useState(0);
  const [refetchKey, setRefetchKey] = useState(0);

  const triggerRefetch = useCallback(() => {
    setRefetchKey((prev) => prev + 1);
  }, []);

  if (!plmEnabled) {
    return <>{children}</>;
  }

  const draftsComponent = (
    <MyDraftProposals
      key={`drafts-${refetchKey}`}
      fetchDraftProposals={fetchDraftProposals}
      onDraftCountChange={setDraftCount}
      onDeleteSuccess={triggerRefetch}
    />
  );

  const sponsorshipComponent = (
    <MySponsorshipRequests
      key={`sponsorship-${refetchKey}`}
      fetchDraftProposals={fetchSponsorshipProposals}
      onCountChange={setSponsorshipCount}
    />
  );

  return (
    <ProposalsTabsClient
      draftCount={draftCount}
      sponsorshipCount={sponsorshipCount}
      draftsComponent={draftsComponent}
      sponsorshipComponent={sponsorshipComponent}
    >
      {children}
    </ProposalsTabsClient>
  );
}
