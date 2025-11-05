import { NextRequest, NextResponse } from "next/server";
import { traceWithUserId } from "../../apiUtils";

export async function GET(
  request: NextRequest,
  route: { params: Promise<{ proposalId: string }> }
) {
  const { proposalId } = await route.params;
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { fetchProposal } = await import(
    "../../../common/proposals/getProposals"
  );

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  return await traceWithUserId(authResponse.userId as string, async () => {
    try {
      const proposal = await fetchProposal(proposalId);
      return NextResponse.json(proposal);
    } catch (e: any) {
      return new Response("Internal server error: " + e.toString(), {
        status: 500,
      });
    }
  });
}
