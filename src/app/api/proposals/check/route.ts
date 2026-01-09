import { NextRequest, NextResponse } from "next/server";
import { createCheckProposalAttestation } from "@/lib/eas-server";
import { createProposalLinks } from "@/lib/actions/proposalLinks";
import { fetchProposalsFromArchive } from "@/lib/archiveUtils";
import { fetchVotingPowerFromContract } from "@/lib/votingPowerUtils";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { erc721Abi } from "viem";

export const maxDuration = 60;

async function getForumSettings(daoSlug: string) {
  try {
    const result = await prismaWeb2Client.$queryRaw<
      Array<{
        min_vp_for_proposals: number;
      }>
    >`
      SELECT min_vp_for_proposals
      FROM alltenant.dao_forum_settings
      WHERE dao_slug = ${daoSlug}
    `;

    if (result.length === 0) {
      return { minVpForProposals: 1 };
    }

    return {
      minVpForProposals: result[0].min_vp_for_proposals,
    };
  } catch (error) {
    console.error("Failed to fetch forum settings:", error);
    return { minVpForProposals: 1 };
  }
}

async function hasNFT(
  address: string,
  nftContractAddress: `0x${string}`
): Promise<boolean> {
  try {
    const client = getPublicClient();
    const balance = await client.readContract({
      address: nftContractAddress,
      abi: erc721Abi,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    });

    return balance > 0n;
  } catch (error) {
    console.error("Error checking NFT balance:", error);
    return false;
  }
}

async function checkProposal(attester: string, tags: string[]) {
  const { slug, namespace, contracts } = Tenant.current();
  const client = getPublicClient();

  const postType = tags[0];
  const relatedLinks = tags.slice(1);

  const isTempCheck = postType === "tempcheck";
  const isGovProposal = postType === "gov-proposal";
  const adminStatus = await isAdmin(attester, slug);

  if (isGovProposal) {
    if (namespace === TENANT_NAMESPACES.TOWNS) {
      const townsNFTAddress =
        "0x7c0422b31401C936172C897802CF0373B35B7698" as `0x${string}`;
      const userHasNFT = await hasNFT(attester, townsNFTAddress);

      if (userHasNFT) {
        return { passed: true, relatedLinks, postType };
      }
    }

    const relatedTempChecks = relatedLinks.filter((link) =>
      link.includes("0x")
    );

    if (relatedTempChecks.length === 0) {
      return { passed: false, relatedLinks, postType };
    }

    const archiveProposals = await fetchProposalsFromArchive(namespace, "all");
    const proposalsMap = new Map(
      archiveProposals.data.map((p) => [p.uid || p.id, p])
    );

    let hasApprovedTempCheck = false;
    let isAuthorOfTempCheck = false;

    for (const tempCheckId of relatedTempChecks) {
      const tempCheckProposal = proposalsMap.get(tempCheckId);

      if (!tempCheckProposal) {
        continue;
      }

      if (
        tempCheckProposal.proposer?.toLowerCase() === attester.toLowerCase()
      ) {
        isAuthorOfTempCheck = true;
      }
      if (tempCheckProposal.lifecycle_stage === "PASSED") {
        hasApprovedTempCheck = true;
        break;
      }
    }

    if (!(adminStatus || isAuthorOfTempCheck) || !hasApprovedTempCheck) {
      return { passed: false, relatedLinks, postType };
    }
  }

  const votingPower = await fetchVotingPowerFromContract(client, attester, {
    namespace,
    contracts,
  });
  const currentVP = Number(votingPower / BigInt(10 ** 18));

  const settings = await getForumSettings(slug);
  const requiredVP = settings.minVpForProposals;

  if (isTempCheck) {
    if (!adminStatus && currentVP < requiredVP) {
      return { passed: false, relatedLinks, postType };
    }
  }

  return { passed: true, relatedLinks, postType };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { proposalId, attester, tags } = body;

    if (!proposalId || !attester || !tags) {
      return NextResponse.json(
        { error: "proposalId, attester, and tags are required" },
        { status: 400 }
      );
    }

    const { contracts, namespace } = Tenant.current();

    const archiveProposals = await fetchProposalsFromArchive(namespace, "all");
    const proposalExists = archiveProposals.data.some(
      (p) => p.uid === proposalId || p.id === proposalId
    );

    if (proposalExists) {
      return NextResponse.json({
        success: true,
        message: "Proposal already exists in archive",
      });
    }

    const { passed, relatedLinks, postType } = await checkProposal(
      attester,
      tags
    );

    if (!passed) {
      return NextResponse.json({
        success: false,
        message: "Proposal did not pass validation checks",
        linksCreated: 0,
      });
    }

    const targetType = postType === "tempcheck" ? "tempcheck" : "gov";

    if (relatedLinks.length > 0) {
      const linkPromises = relatedLinks.map((linkId) => {
        if (linkId.startsWith("0x")) {
          return createProposalLinks({
            sourceId: linkId,
            sourceType: "tempcheck",
            links: [{ targetId: proposalId, targetType }],
          });
        }
        return createProposalLinks({
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
        contracts.easRecipient || "0x0000000000000000000000000000000000000000",
      passed: [],
      failed: [],
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error checking proposal:", error);
    return NextResponse.json(
      {
        error: "Failed to check proposal",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
