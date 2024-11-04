"use client";

import { Delegation } from "@/app/api/common/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import DelegationFromRow from "./DelegationFromRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginatedResult } from "@/app/lib/pagination";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";

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
  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegators.meta);
  const [delegators, setDelegators] = useState(initialDelegators.data);

  useEffect(() => {
    setDelegators(initialDelegators.data);
    setMeta(initialDelegators.meta);
  }, [initialDelegators]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      fetching.current = true;
      const data = await fetchDelegators({
        offset: meta.next_offset,
        limit: meta.total_returned,
      });
      setDelegators(delegators.concat(data.data));
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  if (delegatees.length === 0 && delegators.length === 0) {
    return (
      <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
        No delegations found.
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <Tabs className="max-w-full mb-8" defaultValue="delegatedFrom">
        <div className="flex flex-row items-center justify-between">
          <TabsList>
            <TabsTrigger className="text-2xl" value="delegatedFrom">
              Delegated from
            </TabsTrigger>
            <TabsTrigger className="text-2xl" value="delegatedTo">
              Delegated to
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="delegatedFrom" className="max-w-full">
          <div className="flex flex-col gap-3 border border-line shadow-sm rounded-xl overflow-auto max-h-[500px]">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <Table className="min-w-full">
                  <TableHeader className="text-xs text-secondary sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="h-10 text-secondary">
                        Allowance
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
                  <InfiniteScroll
                    hasMore={meta.has_next}
                    pageStart={1}
                    loadMore={loadMore}
                    loader={
                      <TableRow key={0}>
                        <TableCell
                          key="loader"
                          className="gl_loader justify-center py-6 text-sm text-secondary"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    }
                    // References styles of TableBody
                    className="[&_tr:last-child]:border-0"
                    element="tbody"
                    useWindow={false}
                  >
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
                  </InfiniteScroll>
                </Table>
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
                    Allowance
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
                  <td
                    className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                    colSpan={6}
                  >
                    None found
                  </td>
                ) : (
                  delegatees.map((delegation) => (
                    <DelegationToRow
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
