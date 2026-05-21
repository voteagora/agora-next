/*
 * TanStack Start port of src/app/api/proposals/check/route.ts.
 * URL: POST /api/proposals/check
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/proposals/check")({
  server: {
    handlers: {
      POST: withApiAuth(
        async ({ request }) => {
          const { createCheckProposalAttestation } = await import(
            "@/lib/eas-server"
          );
          const { createProposalLinksInternal } = await import(
            "@/lib/actions/proposalLinksInternal"
          );
          const { fetchProposalsFromArchive } = await import(
            "@/lib/archiveUtils"
          );
          const { fetchVotingPowerFromContract } = await import(
            "@/lib/votingPowerUtils"
          );
          const { getPublicClient } = await import("@/lib/viem");
          const { default: Tenant } = await import("@/lib/tenant/tenant");
          const { prismaWeb2Client } = await import("@/lib/prisma");
          const { TENANT_NAMESPACES } = await import("@/lib/constants");
          const { erc721Abi } = await import("viem");
          const { checkPermission } = await import("@/lib/rbac");

          try {
            const authHeader = request.headers.get("authorization");
            const cronSecret = process.env.CRON_SECRET;

            if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
              return Response.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await request.json();
            const { proposalId, attester, tags } = body;

            if (!proposalId || !attester || !tags) {
              return Response.json(
                { error: "proposalId, attester, and tags are required" },
                { status: 400 }
              );
            }

            const { contracts, namespace, slug } = Tenant.current();

            const archiveProposals = await fetchProposalsFromArchive(
              namespace,
              "all"
            );
            const proposalExists = archiveProposals.data.some(
              (p) => p.uid === proposalId || p.id === proposalId
            );

            if (proposalExists) {
              return Response.json({
                success: true,
                message: "Proposal already exists in archive",
              });
            }

            const postType = tags[0];
            const relatedLinks = tags.slice(1);
            const isTempCheck = postType === "tempcheck";
            const isGovProposal = postType === "gov-proposal";
            const adminStatus = await checkPermission(
              attester,
              slug,
              "proposals",
              "proposals",
              "create"
            );

            let passed = true;

            if (isGovProposal) {
              if (namespace === TENANT_NAMESPACES.TOWNS) {
                const townsNFTAddress =
                  "0x7c0422b31401C936172C897802CF0373B35B7698" as `0x${string}`;
                const client = getPublicClient();
                const balance = await client
                  .readContract({
                    address: townsNFTAddress,
                    abi: erc721Abi,
                    functionName: "balanceOf",
                    args: [attester as `0x${string}`],
                  })
                  .catch(() => 0n);

                if (balance > 0n) {
                  passed = true;
                } else {
                  const relatedTempChecks = relatedLinks.filter(
                    (link: string) => link.includes("0x")
                  );

                  if (relatedTempChecks.length === 0) {
                    passed = false;
                  } else {
                    const allArchiveProposals = await fetchProposalsFromArchive(
                      namespace,
                      "all"
                    );
                    const proposalsMap = new Map(
                      allArchiveProposals.data.map((p) => [p.uid || p.id, p])
                    );

                    let hasApprovedTempCheck = false;
                    let isAuthorOfTempCheck = false;

                    for (const tempCheckId of relatedTempChecks) {
                      const tempCheckProposal = proposalsMap.get(tempCheckId);
                      if (!tempCheckProposal) continue;
                      if (
                        tempCheckProposal.proposer?.toLowerCase() ===
                        attester.toLowerCase()
                      ) {
                        isAuthorOfTempCheck = true;
                      }
                      if (
                        ["PASSED", "SUCCEEDED", "QUEUED", "EXECUTED"].includes(
                          tempCheckProposal.lifecycle_stage || ""
                        )
                      ) {
                        hasApprovedTempCheck = true;
                        break;
                      }
                    }

                    if (
                      !(adminStatus || isAuthorOfTempCheck) ||
                      !hasApprovedTempCheck
                    ) {
                      passed = false;
                    }
                  }
                }
              } else {
                const relatedTempChecks = relatedLinks.filter((link: string) =>
                  link.includes("0x")
                );

                if (relatedTempChecks.length === 0) {
                  passed = false;
                } else {
                  const allArchiveProposals = await fetchProposalsFromArchive(
                    namespace,
                    "all"
                  );
                  const proposalsMap = new Map(
                    allArchiveProposals.data.map((p) => [p.uid || p.id, p])
                  );

                  let hasApprovedTempCheck = false;
                  let isAuthorOfTempCheck = false;

                  for (const tempCheckId of relatedTempChecks) {
                    const tempCheckProposal = proposalsMap.get(tempCheckId);
                    if (!tempCheckProposal) continue;
                    if (
                      tempCheckProposal.proposer?.toLowerCase() ===
                      attester.toLowerCase()
                    ) {
                      isAuthorOfTempCheck = true;
                    }
                    if (
                      ["PASSED", "SUCCEEDED", "QUEUED", "EXECUTED"].includes(
                        tempCheckProposal.lifecycle_stage || ""
                      )
                    ) {
                      hasApprovedTempCheck = true;
                      break;
                    }
                  }

                  if (
                    !(adminStatus || isAuthorOfTempCheck) ||
                    !hasApprovedTempCheck
                  ) {
                    passed = false;
                  }
                }
              }
            }

            if (passed) {
              const client = getPublicClient();
              const votingPower = await fetchVotingPowerFromContract(
                client,
                attester,
                { namespace, contracts }
              );
              const currentVP = Number(votingPower / BigInt(10 ** 18));

              const result = await prismaWeb2Client.$queryRaw<
                Array<{ min_vp_for_proposals: number }>
              >`
                SELECT min_vp_for_proposals
                FROM alltenant.dao_forum_settings
                WHERE dao_slug = ${slug}
              `.catch(() => []);

              const requiredVP =
                result.length > 0 ? result[0].min_vp_for_proposals : 1;

              if (isTempCheck && !adminStatus && currentVP < requiredVP) {
                passed = false;
              }
            }

            if (!passed) {
              return Response.json({
                success: false,
                message: "Proposal did not pass validation checks",
                linksCreated: 0,
              });
            }

            const targetType = isTempCheck ? "tempcheck" : "gov";

            if (relatedLinks.length > 0) {
              const linkPromises = relatedLinks.map((linkId: string) => {
                if (linkId.startsWith("0x")) {
                  return createProposalLinksInternal({
                    sourceId: linkId,
                    sourceType: "tempcheck",
                    links: [{ targetId: proposalId, targetType }],
                  });
                }
                return createProposalLinksInternal({
                  sourceId: linkId,
                  sourceType: "forum_topic",
                  links: [{ targetId: proposalId, targetType }],
                });
              });
              await Promise.allSettled(linkPromises);
            }

            await createCheckProposalAttestation({
              proposalId,
              daoUuid:
                contracts.easRecipient ||
                "0x0000000000000000000000000000000000000000",
              passed: [],
              failed: [],
            });

            return Response.json({ success: true });
          } catch (error) {
            console.error("Error checking proposal:", error);
            return Response.json(
              {
                error: "Failed to check proposal",
                details: error instanceof Error ? error.message : String(error),
              },
              { status: 500 }
            );
          }
        },
        { skipAuth: true }
      ),
    },
  },
});
