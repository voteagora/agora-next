"use client";

import { useEffect } from "react";
import { useQueryState } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TAB_PARAM = "view";

export function ProposalsTabsClient({
  children,
  draftsComponent,
  sponsorshipComponent,
  draftCount,
  sponsorshipCount,
}: {
  children: React.ReactNode;
  draftsComponent?: React.ReactNode;
  sponsorshipComponent?: React.ReactNode;
  draftCount: number;
  sponsorshipCount: number;
}) {
  const [activeTab, setTab] = useQueryState(TAB_PARAM, {
    defaultValue: "proposals",
    history: "push",
    shallow: true,
  });

  useEffect(() => {
    if (activeTab === "drafts" && draftCount === 0) {
      setTab("proposals");
    } else if (activeTab === "sponsorship" && sponsorshipCount === 0) {
      setTab("proposals");
    }
  }, [activeTab, draftCount, sponsorshipCount, setTab]);

  const hasAnyContent = draftCount > 0 || sponsorshipCount > 0;

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setTab(value)}
      className="w-full"
    >
      {hasAnyContent && (
        <TabsList className="mb-8">
          <TabsTrigger value="proposals" variant="underlined">
            Proposals
          </TabsTrigger>
          {draftCount > 0 && (
            <TabsTrigger value="drafts" variant="underlined">
              Drafts
            </TabsTrigger>
          )}
          {sponsorshipCount > 0 && (
            <TabsTrigger value="sponsorship" variant="underlined">
              Sponsorship Requests
            </TabsTrigger>
          )}
        </TabsList>
      )}
      <TabsContent value="proposals" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent
        value="drafts"
        className="mt-0 data-[state=inactive]:hidden"
        forceMount
      >
        {draftsComponent}
      </TabsContent>
      <TabsContent
        value="sponsorship"
        className="mt-0 data-[state=inactive]:hidden"
        forceMount
      >
        {sponsorshipComponent}
      </TabsContent>
    </Tabs>
  );
}
