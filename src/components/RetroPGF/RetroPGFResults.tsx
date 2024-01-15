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
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroller";
import { useRef } from "react";

// TODO: frh -> do infinite scroll and see if there are more categories
const categories = {
  END_USER_EXPERIENCE_AND_ADOPTION: "End UX & Adoption",
  DEVELOPER_ECOSYSTEM: "Tooling and utilities",
};

export type Results = {
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
    profile: {
      name: string;
      profileImageUrl: string | null;
    };
  };
}[];

export default function RetroPGFResults({
  results,
  hasNextPage,
}: {
  results: Results;
  hasNextPage: boolean;
}) {
  const fetching = useRef(false);

  // TODO: frh type
  // const loadMore = async (page: number | string) => {
  //   if (!fetching.current && meta.hasNextPage) {
  //     fetching.current = true;
  //     const data = await fetchDelegateVotes(page, sortOrder);
  //     setMeta(data.meta);
  //     setDelegateVotes((prev) =>
  //       getUniqueDelegateVotes(prev.concat(data.votes))
  //     );
  //     fetching.current = false;
  //   }
  // };
  console.log("results: ", results);
  return (
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
        {/* @ts-ignore */}
        <InfiniteScroll
          hasMore={true}
          pageStart={0}
          loadMore={() => console.log("heelo")}
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
        >
          {results.map((result) => {
            const {
              awarded,
              displayName,
              id,
              impactCategory,
              includedInBallots,
              profile,
            } = result.node;
            const _profile = "solidity.lang.eth";
            return (
              <TableRow className="border-none" key={id}>
                <TableCell>
                  {/* {profile?.profileImageUrl && (
                  <Image
                    src={profile.profileImageUrl}
                    alt={displayName}
                    width="32"
                    height="32"
                  />
                )} */}
                  <span className="font-semibold text-black">
                    {displayName}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2 items-center">
                  <Image src={profileIcon} alt={_profile} />
                  <span>{_profile}</span>
                </TableCell>
                <TableCell>
                  {impactCategory.map((category) => (
                    <span
                      className="mx-1 py-0.5 px-1 rounded-[4px] bg-gray-fa text-xs"
                      key={category}
                    >
                      {categories[category]}
                    </span>
                  ))}
                </TableCell>
                <TableCell className="text-right">
                  {includedInBallots}
                </TableCell>
                {/* TODO: frh -> this field */}
                <TableCell className="text-right">14</TableCell>
                {/* TODO: frh -> see how to get total and formatting */}
                <TableCell className="text-right flex justify-end gap-2 items-center">
                  <span className="font-semibold text-black">500,000 OP</span>
                  <span className="text-xs">(2,42%)</span>
                </TableCell>
              </TableRow>
            );
          })}
        </InfiniteScroll>
      </TableBody>
    </Table>
  );
}
