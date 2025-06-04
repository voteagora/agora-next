"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DelegateTableRow from "./DelegateTableRow";
import { DelegateToSelfBanner } from "./DelegateToSelfBanner";
import Tenant from "@/lib/tenant/tenant";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";

interface Props {
  initialDelegates: PaginatedResult<DelegateChunk[]>;
  fetchDelegates: (
    pagination: PaginationParams,
    seed?: number
  ) => Promise<PaginatedResult<DelegateChunk[]>>;
}

export default function DelegateTable({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.data);

  const fetching = useRef(false);

  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;
  const { isAdvancedUser } = useIsAdvancedUser();
  const { advancedDelegators } = useConnectedDelegate();

  const { setIsDelegatesFiltering } = useAgoraContext();

  useEffect(() => {
    setIsDelegatesFiltering(false);
    setDelegates(initialDelegates.data);
    setMeta(initialDelegates.meta);
  }, [initialDelegates, setIsDelegatesFiltering]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next) {
      try {
        fetching.current = true;
        const data = await fetchDelegates(
          { offset: meta.next_offset, limit: meta.total_returned },
          initialDelegates.seed || Math.random()
        );
        setDelegates(delegates.concat(data.data));
        setMeta(data.meta);
      } catch (error) {
        console.error("Error loading more delegates:", error);
      } finally {
        fetching.current = false;
      }
    }
  };

  return (
    <DialogProvider>
      {isDelegationEncouragementEnabled && <DelegateToSelfBanner />}

      <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg mt-6">
        <Table className="min-w-full">
          <TableHeader className="text-sm text-secondary sticky top-0 bg-neutral z-10 rounded-t-lg">
            <TableRow className="bg-tertiary/5">
              <TableHead className="h-10 text-secondary">Name</TableHead>
              <TableHead className="h-10 text-secondary">
                Voting power
              </TableHead>
              {/* Used for debugging purposes */}
              {/* <TableHead className="h-10 text-secondary">7d Change</TableHead> */}
              <TableHead className="h-10 text-secondary">
                Participation
              </TableHead>
              <TableHead className="h-10 text-secondary">
                Delegated from
              </TableHead>
              <TableHead className="h-10 text-secondary">Info</TableHead>
              <TableHead className="h-10 text-secondary"></TableHead>
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
          >
            {delegates.length === 0 ? (
              <td
                className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                colSpan={6}
              >
                None found
              </td>
            ) : (
              delegates.map((delegate) => (
                <DelegateTableRow
                  key={delegate.address}
                  delegate={
                    delegate as DelegateChunk & {
                      numOfDelegators: bigint;
                      participation: number;
                    }
                  }
                  isAdvancedUser={isAdvancedUser}
                  delegators={advancedDelegators}
                />
              ))
            )}
          </InfiniteScroll>
        </Table>
      </div>
    </DialogProvider>
  );
}
