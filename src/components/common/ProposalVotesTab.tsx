import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProposalVotesTab = ({
  setTab,
  activeTab,
}: {
  setTab: (tab: string) => void;
  activeTab: string;
}) => {
  return (
    <div className="pl-4 pt-6 pr-6 border-b border-line">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setTab(value)}
        className="w-full"
      >
        <TabsList className="h-auto">
          <TabsTrigger
            data-testid="proposal-results-tab"
            value="results"
            variant="underlined"
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            data-testid="proposal-votes-tab"
            value="votes"
            variant="underlined"
          >
            Votes
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
