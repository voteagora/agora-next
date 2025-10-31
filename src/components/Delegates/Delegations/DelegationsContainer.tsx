"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import DelegationFromRow from "./DelegationFromRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginatedResult } from "@/app/lib/pagination";
import { useEffect, useRef, useState } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useQueryState } from "nuqs";

const SUBTAB_PARAM = "subtab";

function DelegationsContainer({
  delegatees,
  initialDelegators,
  fetchDelegators,
}: {
  delegatees: Delegation[];
  initialDelegators: PaginatedResult<Delegation[]>;
  fetchDelegators: (params: {
    offset: number;
    limit: number;
  }) => Promise<PaginatedResult<Delegation[]>>;
}) {
  const [meta, setMeta] = useState(initialDelegators.meta);
  const [delegators, setDelegators] = useState(initialDelegators.data);

  const [subtab, setSubtab] = useQueryState(SUBTAB_PARAM, {
    defaultValue: "delegatedFrom",
    history: "push",
    shallow: true,
  });

  const { data: tokenBalance } = useTokenBalance(delegatees[0]?.from);
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDelegators(initialDelegators.data);
    setMeta(initialDelegators.meta);
  }, [initialDelegators]);

  const loadMore = async () => {
    if (!isLoadingRef.current && meta.has_next) {
      isLoadingRef.current = true;
      setIsLoading(true);
      const data = await fetchDelegators({
        offset: meta.next_offset,
        limit: 20,
      });
      isLoadingRef.current = false;
      setIsLoading(false);
      setMeta(data.meta);
      setDelegators(delegators.concat(data.data));
    }
  };

  delegatees = delegatees.filter(
    (delegation) =>
      delegation.to !== "0x0000000000000000000000000000000000000000"
  );

  if (delegatees.length === 0 && delegators.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-primary">Delegations</h2>
        <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl border border-line shadow-newDefault">
          No delegations found.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full text-primary">
      <Tabs
        className="max-w-full"
        value={subtab || "delegatedFrom"}
        onValueChange={setSubtab}
      >
        <div className="flex flex-row items-center justify-between">
          <TabsList>
            <TabsTrigger
              className="text-2xl opacity-60 data-[state=active]:opacity-100"
              value="delegatedFrom"
            >
              Delegated from
            </TabsTrigger>
            <TabsTrigger
              className="text-2xl opacity-60 data-[state=active]:opacity-100"
              value="delegatedTo"
            >
              Delegated to
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="delegatedFrom" className="max-w-full">
          <div className="flex flex-col gap-3 border border-line shadow-sm rounded-xl overflow-auto max-h-[500px] bg-wash">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <Table className="min-w-full">
                  <TableHeader className="text-xs text-secondary sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="h-10 text-secondary">
                        Voting Power
                      </TableHead>
                      <TableHead className="h-10 text-secondary">
                        Delegated on
                      </TableHead>
                      <TableHead className="h-10 text-secondary">
                        From
                      </TableHead>
                      <TableHead className="h-10 text-secondary">
                        Txn Hash
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delegators.length === 0 ? (
                      <td
                        className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                        colSpan={6}
                      >
                        None found
                      </td>
                    ) : (
                      delegators.map((delegation) => (
                        <DelegationFromRow
                          key={delegation.from}
                          delegation={delegation}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
                {meta.has_next && (
                  <div className="text-center my-4">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-4 py-2 text-primary text-sm bg-wash hover:bg-wash/80 rounded-lg"
                    >
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="delegatedTo">
          <div className="flex flex-col gap-3 border border-line shadow-sm rounded-xl overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="text-xs text-secondary sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="h-10 text-secondary">
                    Current Token Balance
                  </TableHead>
                  <TableHead className="h-10 text-secondary">
                    Delegated on
                  </TableHead>
                  <TableHead className="h-10 text-secondary">To</TableHead>
                  <TableHead className="h-10 text-secondary">
                    Txn Hash
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegatees.length === 0 ? (
                  <TableRow>
                    <td
                      className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                      colSpan={6}
                    >
                      None found
                    </td>
                  </TableRow>
                ) : (
                  delegatees.map((delegation) => (
                    <DelegationToRow
                      tokenBalance={tokenBalance}
                      key={delegation.to}
                      delegation={delegation}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DelegationsContainer;
