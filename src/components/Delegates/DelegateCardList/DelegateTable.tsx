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
  fetchDelegates: (args: {
    pagination?: PaginationParams;
    seed?: number;
    showParticipation?: boolean;
  }) => Promise<PaginatedResult<DelegateChunk[]>>;
}

const batchSize = 50;

export default function DelegateTable({
  initialDelegates,
  fetchDelegates,
}: Props) {
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(
    initialDelegates.data.slice(0, batchSize)
  );
  const [dataFromServer, setDataFromServer] = useState<DelegateChunk[]>(
    initialDelegates.data
  );
  const fetching = useRef(false);

  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;
  const showParticipation =
    (ui.toggle("show-participation")?.enabled || false) &&
    !(ui.toggle("hide-participation-delegates-page")?.enabled || false);
  const hide7dChange = ui.toggle("hide-7d-change")?.enabled ?? false;
  const { isAdvancedUser } = useIsAdvancedUser();
  const { advancedDelegators } = useConnectedDelegate();

  const { setIsDelegatesFiltering, isDelegatesFiltering } = useAgoraContext();

  useEffect(() => {
    setDelegates(initialDelegates.data.slice(0, batchSize));
    setMeta(initialDelegates.meta);
    setDataFromServer(initialDelegates.data);
    setIsDelegatesFiltering(false);
  }, [initialDelegates, setIsDelegatesFiltering]);

  const loadMore = async () => {
    if (!fetching.current && meta.has_next && !isDelegatesFiltering) {
      try {
        fetching.current = true;

        // Check if we have more initial data to show
        const remainingInitialData = dataFromServer.slice(delegates.length);

        if (remainingInitialData.length > 0) {
          const nextBatch = remainingInitialData.slice(0, batchSize);
          setDelegates((prev) => [...prev, ...nextBatch]);
        } else {
          // No more initial data, fetch from API
          const data = await fetchDelegates({
            pagination: {
              offset: meta.next_offset,
              limit: meta.total_returned,
            },
            seed: initialDelegates.seed || Math.random(),
            showParticipation,
          });
          setDelegates((prev) => [...prev, ...data.data.slice(0, batchSize)]);
          setDataFromServer((prev) => [...prev, ...data.data]);
          setMeta(data.meta);
        }
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
              {!hide7dChange && (
                <TableHead className="h-10 text-secondary">7d Change</TableHead>
              )}
              {showParticipation && (
                <TableHead className="h-10 text-secondary">
                  Participation
                </TableHead>
              )}
              <TableHead className="h-10 text-secondary">
                # of Delegators
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
                colSpan={
                  5 + (!hide7dChange ? 1 : 0) + (showParticipation ? 1 : 0)
                }
              >
                None found
              </td>
            ) : (
              delegates.map((delegate, index) => (
                <DelegateTableRow
                  key={delegate.address + index}
                  delegate={
                    delegate as DelegateChunk & {
                      numOfDelegators: bigint;
                      participation: number;
                    }
                  }
                  isAdvancedUser={isAdvancedUser}
                  delegators={advancedDelegators}
                  showParticipation={showParticipation}
                  show7dChange={!hide7dChange}
                />
              ))
            )}
          </InfiniteScroll>
        </Table>
      </div>
    </DialogProvider>
  );
}
