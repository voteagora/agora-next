import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../../v1/apiUtils";
import { getArchiveProposal } from "../archiveService";

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ proposalId: string }> }
) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return traceWithUserId(authResponse.userId as string, async () => {
    try {
      const { proposalId } = await route.params;
      const proposal = await getArchiveProposal(proposalId);

      if (!proposal) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(proposal);
    } catch (error) {
      return new Response("Internal server error: " + String(error), {
        status: 500,
      });
    }
  });
}
