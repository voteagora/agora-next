import { NextRequest, NextResponse } from "next/server";
import { createCheckProposalAttestation } from "@/lib/eas-server";
import { createProposalLinks } from "@/lib/actions/proposalLinks";
import { fetchProposalsFromArchive } from "@/lib/archiveUtils";
import { fetchVotingPowerFromContract } from "@/lib/votingPowerUtils";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";
import { prismaWeb2Client } from "@/app/lib/prisma";
import { DaoSlug } from "@prisma/client";

async function isAdmin(address: string, daoSlug: string): Promise<boolean> {
  try {
    const result = await prismaWeb2Client.forumAdmin.findFirst({
      where: {
        address: address.toLowerCase(),
        managedAccounts: {
          has: daoSlug as DaoSlug,
        },
      },
    });
    return !!result;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

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

async function checkProposal(attester: string, tags: string[]) {
  const { slug, namespace, contracts } = Tenant.current();
  const client = getPublicClient();

  const postType = tags[0];
  const relatedLinks = tags.slice(1);

  const isTempCheck = postType === "tempcheck";
  const isGovProposal = postType === "gov-proposal";

  const votingPower = await fetchVotingPowerFromContract(client, attester, {
    namespace,
    contracts,
  });
  const currentVP = Number(votingPower / BigInt(10 ** 18));

  const settings = await getForumSettings(slug);
  const requiredVP = settings.minVpForProposals;
  const adminStatus = await isAdmin(attester, slug);

  if (isTempCheck) {
    if (!adminStatus && currentVP < requiredVP) {
      return { passed: false, relatedLinks, postType };
    }
  }

  if (isGovProposal) {
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

      if (tempCheckProposal.lifecycle_stage === "SUCCEEDED") {
        hasApprovedTempCheck = true;
        break;
      }
    }

    if (!(adminStatus || isAuthorOfTempCheck) || !hasApprovedTempCheck) {
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

    const attestationPromise = createCheckProposalAttestation({
      proposalId,
      daoUuid:
        contracts.easRecipient || "0x0000000000000000000000000000000000000000",
      passed: [],
      failed: [],
    })
      .then(() => {
        console.log("Attestation created successfully");
      })
      .catch((error) => {
        console.error("Attestation failed:", error);
      });

    const linkPromises: Promise<void>[] = [];
    if (relatedLinks.length > 0) {
      relatedLinks.forEach((linkId) => {
        const linkPromise = (async () => {
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
        })().catch((error) => {
          console.error("Link creation failed:", error);
        });
        linkPromises.push(linkPromise as Promise<void>);
      });
    }

    Promise.allSettled([attestationPromise, ...linkPromises]);

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
