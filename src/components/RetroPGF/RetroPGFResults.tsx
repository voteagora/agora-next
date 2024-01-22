"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import profileIcon from "@/icons/profile.svg";
import projectPlaceholder from "@/icons/projectPlaceholder.svg";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroller";
import { useEffect, useRef, useState } from "react";
import { getRetroPGFResults } from "@/app/retropgf/actions";
import { shortAddress } from "@/lib/utils";

const categories = {
  COLLECTIVE_GOVERNANCE: "Collective Governance",
  DEVELOPER_ECOSYSTEM: "Developer Ecosystem",
  END_USER_EXPERIENCE_AND_ADOPTION: "End UX & Adoption",
  OP_STACK: "OP Stack",
};

export type Result = {
  node: {
    applicant: {
      address: {
        address: string;
        resolvedName: {
          address: string;
          name: string | null;
        };
      };
    };
    awarded: string;
    displayName: string;
    id: string;
    impactCategory: (keyof typeof categories)[];
    includedInBallots: number;
    includedInLists: number;
    profile: {
      name: string;
      profileImageUrl: string | null;
    };
  };
};

export type Results = Result[];

type pageInfo = {
  hasNextPage: boolean;
  endCursor: string;
};

export default function RetroPGFResults({
  initialResults,
  initialPageInfo,
}: {
  initialResults: Results;
  initialPageInfo: pageInfo;
}) {
  const [results, setResults] = useState(initialResults);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const fetching = useRef(false);

  useEffect(() => {
    setResults(initialResults);
    setPageInfo(initialPageInfo);
  }, [initialResults, initialPageInfo]);

  const loadMore = async () => {
    if (!fetching.current && pageInfo.hasNextPage) {
      fetching.current = true;
      const _results = await getRetroPGFResults(pageInfo.endCursor).catch(
        (error) => console.error("error", error)
      );
      const existingIds = new Set(
        results.map((result: Result) => result.node.id)
      );
      const uniqueResults = _results.edges.filter(
        (result: Result) => !existingIds.has(result.node.id)
      );
      setResults((prev) => prev.concat(uniqueResults));
      setPageInfo(_results.pageInfo);
      fetching.current = false;
    }
  };
  return (
    <>
      {/* @ts-ignore */}
      <InfiniteScroll
        hasMore={pageInfo?.hasNextPage}
        pageStart={0}
        loadMore={loadMore}
        loader={
          <div key="loader">
            Loading... <br />
            <Image
              src="/images/blink.gif"
              alt="Blinking Agora Logo"
              width={50}
              height={20}
            />
          </div>
        }
        element="main"
      >
        <Table>
          <TableHeader className="border-none">
            <TableRow className="border-none">
              <TableHead className="text-xs" variant="gray">
                Project
              </TableHead>
              <TableHead className="text-xs" variant="gray">
                Submitted by
              </TableHead>
              <TableHead className="text-xs" variant="gray">
                Categories
              </TableHead>
              <TableHead className="text-xs text-right" variant="gray">
                In ballots
              </TableHead>
              <TableHead className="text-xs text-right" variant="gray">
                In lists
              </TableHead>
              <TableHead className="text-xs text-right" variant="gray">
                Amount received
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-gray-4f font-medium text-base">
            {results.map((result) => {
              const {
                applicant,
                awarded,
                displayName,
                id,
                impactCategory,
                includedInBallots,
                includedInLists,
                profile,
              } = result.node;

              const submittedBy =
                applicant.address.resolvedName?.name ||
                shortAddress(applicant.address.address);

              return (
                <TableRow className="border-none" key={id}>
                  <TableCell>
                    {profile?.profileImageUrl ? (
                      <Image
                        src={profile.profileImageUrl}
                        alt={displayName}
                        width="32"
                        height="32"
                      />
                    ) : (
                      <Image
                        src={projectPlaceholder}
                        alt={displayName}
                        width="32"
                        height="32"
                      />
                    )}
                    <span className="font-semibold text-black">
                      {displayName}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2 items-center">
                    <Image src={profileIcon} alt={submittedBy} />
                    <span>{submittedBy}</span>
                  </TableCell>
                  <TableCell>
                    {/* We only show two categories + more */}
                    {impactCategory.slice(0, 3).map((category, index) => (
                      <span
                        className="mx-1 py-0.5 px-1 rounded-[4px] bg-gray-fa text-xs"
                        key={category}
                      >
                        {index === 2 ? "More" : categories[category]}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell className="text-right">
                    {includedInBallots}
                  </TableCell>
                  <TableCell className="text-right">
                    {includedInLists}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2 items-center">
                    {/* TODO: frh -> check in old project with percentage and check differences in includedInList, ballots and awarded */}
                    <span className="font-semibold text-black">
                      {awarded} OP
                    </span>
                    <span className="text-xs">(2,42%)</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </InfiniteScroll>
    </>
  );
}
