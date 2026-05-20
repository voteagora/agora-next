/*
 * TanStack Start port of src/app/delegates/[addressOrENSName]/page.tsx.
 * URL: /delegates/:addressOrENSName
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import { type DelegateStatement } from "@/lib/types/delegate";
import DelegateCard from "@/components/Delegates/DelegateCard/DelegateCard";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import DelegateStatementWrapper from "@/components/Delegates/DelegateStatement/DelegateStatementWrapper";
import DelegationsContainer from "@/components/Delegates/Delegations/DelegationsContainer";
import VotesContainer from "@/components/Delegates/DelegateVotes/VotesContainer";
import DelegateVotes from "@/components/Delegates/DelegateVotes/DelegateVotes";
import SnapshotVotes from "@/components/Delegates/DelegateVotes/SnapshotVotes";
import DiscussionsContainer from "@/components/Delegates/Discussions/DiscussionsContainer";
import { VotesContainerSkeleton } from "@/components/Delegates/DelegateVotes/VotesContainerWrapper";
import { DelegationsContainerSkeleton } from "@/components/Delegates/Delegations/DelegationsContainerWrapper";
import { DiscussionsContainerSkeleton } from "@/components/Delegates/Discussions/DiscussionsContainerWrapper";

const PROFILE_AUX_PREFETCH = { offset: 0, limit: 20 } as const;

// ─── server functions for client-invoked callbacks ───────────────────────────

const serverFetchDelegateVotes = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { address: string; offset: number; limit: number }) => data
  )
  .handler(async ({ data }) => {
    const { fetchVotesForDelegate } = await import("@/app/delegates/actions");
    return fetchVotesForDelegate(data.address, {
      offset: data.offset,
      limit: data.limit,
    });
  });

const serverFetchSnapshotVotes = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { address: string; offset: number; limit: number }) => data
  )
  .handler(async ({ data }) => {
    const { fetchSnapshotVotesForDelegate } = await import(
      "@/app/api/common/votes/getVotes"
    );
    return fetchSnapshotVotesForDelegate({
      addressOrENSName: data.address,
      pagination: { offset: data.offset, limit: data.limit },
    });
  });

const serverFetchDelegators = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { address: string; offset: number; limit: number }) => data
  )
  .handler(async ({ data }) => {
    const { fetchCurrentDelegators } = await import("@/app/delegates/actions");
    return fetchCurrentDelegators(data.address, {
      offset: data.offset,
      limit: data.limit,
    });
  });

const serverFetchForumTopics = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { address: string; offset: number; limit: number }) => data
  )
  .handler(async ({ data }) => {
    const { getForumTopicsByUser } = await import("@/lib/actions/forum");
    const result = await getForumTopicsByUser(data.address, {
      limit: data.limit,
      offset: data.offset,
    });
    if (!result.success) {
      return {
        meta: { has_next: false, total_returned: 0, next_offset: 0 },
        data: [],
      };
    }
    return {
      meta: result.data.meta,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: result.data.data.map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        address: topic.address,
        createdAt:
          topic.createdAt instanceof Date
            ? topic.createdAt.toISOString()
            : new Date(topic.createdAt).toISOString(),
        category: topic.category,
        postsCount: topic.postsCount,
      })),
    };
  });

const serverFetchForumPosts = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { address: string; offset: number; limit: number }) => data
  )
  .handler(async ({ data }) => {
    const { getForumPostsByUser } = await import("@/lib/actions/forum");
    const result = await getForumPostsByUser(data.address, {
      limit: data.limit,
      offset: data.offset,
    });
    if (!result.success) {
      return {
        meta: { has_next: false, total_returned: 0, next_offset: 0 },
        data: [],
      };
    }
    return {
      meta: result.data.meta,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: result.data.data.map((post: any) => ({
        id: post.id,
        address: post.address,
        content: post.content,
        createdAt:
          post.createdAt instanceof Date
            ? post.createdAt.toISOString()
            : new Date(post.createdAt).toISOString(),
        topic: post.topic,
      })),
    };
  });

// ─── helpers ─────────────────────────────────────────────────────────────────

function shouldShowNoVotingPowerBanner(
  delegate: { votingPower: { total: string } },
  onchainVotesFirstPage: readonly { weight: string }[]
): boolean {
  if (BigInt(delegate.votingPower.total || "0") !== 0n) {
    return false;
  }
  return onchainVotesFirstPage.some((v) => {
    const raw = (v.weight ?? "").toString().trim().replace(/,/g, "") || "0";
    try {
      return BigInt(raw) === 0n;
    } catch {
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) && n === 0;
    }
  });
}

// ─── route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/delegates/$addressOrENSName")({
  head: ({ loaderData }) => {
    const d = loaderData as
      | { metaTitle?: string; metaDescription?: string }
      | undefined;
    return {
      meta: [
        { title: d?.metaTitle ?? "Delegate" },
        { name: "description", content: d?.metaDescription ?? "" },
      ],
    };
  },
  loader: async ({ params }) => {
    const {
      ensNameToAddress,
      processAddressOrEnsName,
      resolveENSTextRecords,
      resolveEFPStats,
    } = await import("@/app/lib/ENSUtils");
    const { ui, token } = Tenant.current();

    const [address, ensOrTruncatedAddress] = await Promise.all([
      ensNameToAddress(params.addressOrENSName),
      processAddressOrEnsName(params.addressOrENSName),
    ]);

    // Check for SCW address and redirect to owner if found
    const scwConfig = ui.smartAccountConfig;
    if (scwConfig) {
      const { fetchDelegateForSCW } = await import(
        "@/app/api/common/delegates/getDelegateForSCW"
      );
      const scwDelegate = await fetchDelegateForSCW(address);
      if (scwDelegate) {
        throw redirect({
          to: "/delegates/$addressOrENSName",
          params: { addressOrENSName: scwDelegate.address },
        });
      }
    }

    const {
      fetchDelegate,
      fetchCurrentDelegatees,
      fetchCurrentDelegators,
      fetchVotesForDelegate,
    } = await import("@/app/delegates/actions");
    const { fetchBadgesForDelegate } = await import(
      "@/app/api/common/badges/getBadges"
    );

    const [delegate, textRecords, efpStats, badges] = await Promise.all([
      fetchDelegate(address),
      ui.toggle("show-ens-text-records")?.enabled
        ? resolveENSTextRecords(address, ["description", "location"])
        : null,
      ui.toggle("show-efp-stats")?.enabled ? resolveEFPStats(address) : null,
      ui.toggle("show-delegate-badges")?.enabled
        ? fetchBadgesForDelegate(address)
        : null,
    ]);

    if (!delegate) {
      return {
        notFound: true as const,
        ensOrTruncatedAddress,
        metaTitle: `${ensOrTruncatedAddress} on Agora`,
        metaDescription: "",
      };
    }

    const parsedDelegate = Object.assign({}, delegate, {
      statement: delegate.statement
        ? ({ ...delegate.statement, email: null } as DelegateStatement)
        : null,
    });

    const delegateesFetchAddress =
      parsedDelegate.statement?.scw_address || parsedDelegate.address;

    const hasForums = ui.toggle("forums")?.enabled === true;

    // Fetch data for all three async wrappers in parallel
    const { fetchSnapshotVotesForDelegate } = await import(
      "@/app/api/common/votes/getVotes"
    );
    const [
      delegatees,
      inboundDelegatorsFirstPage,
      onchainVotesFirstPage,
      snapshotVotesResult,
      forumTopicsResult,
      forumPostsResult,
    ] = await Promise.all([
      fetchCurrentDelegatees(delegateesFetchAddress),
      fetchCurrentDelegators(parsedDelegate.address, PROFILE_AUX_PREFETCH),
      fetchVotesForDelegate(parsedDelegate.address, PROFILE_AUX_PREFETCH),
      fetchSnapshotVotesForDelegate({
        addressOrENSName: parsedDelegate.address,
      }),
      hasForums
        ? serverFetchForumTopics({
            data: { address: parsedDelegate.address, limit: 10, offset: 0 },
          })
        : null,
      hasForums
        ? serverFetchForumPosts({
            data: { address: parsedDelegate.address, limit: 10, offset: 0 },
          })
        : null,
    ]);

    const showNoVotingPowerBanner = shouldShowNoVotingPowerBanner(
      parsedDelegate,
      onchainVotesFirstPage.data
    );

    const emptyPaginated = {
      meta: { has_next: false, total_returned: 0, next_offset: 0 },
      data: [],
    };

    const initialTopics = forumTopicsResult ?? emptyPaginated;
    const initialPosts = forumPostsResult ?? emptyPaginated;

    const { formatNumber } = await import("@/lib/tokenUtils");
    const statement = (
      parsedDelegate.statement?.payload as { delegateStatement: string }
    )?.delegateStatement;

    const metaTitle = `${ensOrTruncatedAddress} on Agora`;
    const metaDescription = `See what ${ensOrTruncatedAddress} believes and how they vote on ${token.name} governance.`;

    const imgParams = [
      parsedDelegate.votingPower &&
        `votes=${encodeURIComponent(
          `${formatNumber(parsedDelegate.votingPower.total || "0")} ${token.symbol}`
        )}`,
      statement && `statement=${encodeURIComponent(statement)}`,
    ].filter(Boolean);

    return {
      notFound: false as const,
      parsedDelegate,
      textRecords,
      efpStats,
      badges,
      delegatees,
      inboundDelegatorsFirstPage,
      onchainVotesFirstPage,
      snapshotVotes: snapshotVotesResult,
      initialTopics,
      initialPosts,
      showNoVotingPowerBanner,
      hasForums,
      metaTitle,
      metaDescription,
      imgParams,
      ensOrTruncatedAddress,
    };
  },
  component: function DelegatePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    if (data.notFound) {
      return (
        <ResourceNotFound message="Hmm... can't find that address or ENS, please check again." />
      );
    }

    const {
      parsedDelegate,
      textRecords,
      efpStats,
      badges,
      delegatees,
      inboundDelegatorsFirstPage,
      onchainVotesFirstPage,
      snapshotVotes,
      initialTopics,
      initialPosts,
      showNoVotingPowerBanner,
      hasForums,
    } = data;

    const delegateAddress: string = parsedDelegate.address;

    const onchainVotesJsx = (
      <>
        {onchainVotesFirstPage && onchainVotesFirstPage.data.length > 0 ? (
          <div className="flex flex-col gap-4">
            <DelegateVotes
              initialVotes={onchainVotesFirstPage}
              fetchDelegateVotes={(pagination) =>
                serverFetchDelegateVotes({
                  data: {
                    address: delegateAddress,
                    offset: pagination.offset,
                    limit: pagination.limit,
                  },
                })
              }
            />
          </div>
        ) : (
          <div className="p-8 text-center text-secondary align-middle bg-wash border border-line rounded-xl shadow-newDefault">
            No past votes available.
          </div>
        )}
      </>
    );

    const snapshotVotesJsx = (
      <>
        {snapshotVotes && snapshotVotes.data.length > 0 ? (
          <SnapshotVotes
            initialVotes={snapshotVotes}
            fetchSnapshotVotes={(pagination) =>
              serverFetchSnapshotVotes({
                data: {
                  address: delegateAddress,
                  offset: pagination.offset,
                  limit: pagination.limit,
                },
              })
            }
          />
        ) : (
          <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl border border-line shadow-newDefault">
            No past votes available.
          </div>
        )}
      </>
    );

    return (
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 justify-between mt-12 w-full max-w-full">
        <div className="flex flex-col static md:sticky top-16 shrink-0 w-full md:max-w-[330px] lg:max-w-[350px]">
          <DelegateCard
            delegate={parsedDelegate as never}
            description={textRecords?.description}
            location={textRecords?.location}
            followersCount={efpStats?.followers_count}
            followingCount={efpStats?.following_count}
            badges={badges as never}
          />
        </div>
        <div className="flex flex-col md:ml-8 lg:ml-12 min-w-0 flex-1 max-w-full gap-8">
          <DelegateStatementWrapper
            delegate={parsedDelegate as never}
            showNoVotingPowerBanner={showNoVotingPowerBanner}
          />

          {onchainVotesFirstPage ? (
            <VotesContainer
              onchainVotes={onchainVotesJsx}
              snapshotVotes={snapshotVotesJsx}
            />
          ) : (
            <VotesContainerSkeleton />
          )}

          {delegatees !== undefined &&
          inboundDelegatorsFirstPage !== undefined ? (
            <DelegationsContainer
              delegatees={delegatees}
              initialDelegators={inboundDelegatorsFirstPage}
              numOfDelegators={parsedDelegate.numOfDelegators}
              fetchDelegators={(pagination) =>
                serverFetchDelegators({
                  data: {
                    address: delegateAddress,
                    offset: pagination.offset,
                    limit: pagination.limit,
                  },
                })
              }
            />
          ) : (
            <DelegationsContainerSkeleton />
          )}

          {hasForums &&
            (initialTopics !== undefined && initialPosts !== undefined ? (
              <DiscussionsContainer
                delegateAddress={delegateAddress}
                initialTopics={initialTopics}
                initialPosts={initialPosts}
              />
            ) : (
              <DiscussionsContainerSkeleton />
            ))}
        </div>
      </div>
    );
  },
});
