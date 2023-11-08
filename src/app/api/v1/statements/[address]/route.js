import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const statement = await prisma.delegate_statements.findFirst({
    where: { address: params.address },
    include: {
      delegate_bios: true,
    },
  });

  // Check if statement is found
  if (!statement) {
    return NextResponse.json({ statement: {} }, { status: 404 });
  } else {
    // Build out statement response if found
    const response = {
      statement: {
        id: statement.id,
        address: statement.address,
        statement: statement.statement,
        token: statement.token,
        created_at: statement.created_at,
        updated_at: statement.updated_at,
        delegate_bio: {
          id: statement.delegate_bios.id,
          delegate_statement_id: statement.delegate_bios.delegate_statement_id,
          address: statement.delegate_bios.address,
          token: statement.delegate_bios.token,
          twitter_handle: statement.delegate_bios.twitter_handle,
          discord_handle: statement.delegate_bios.discord_handle,
          farcaster_handle: statement.delegate_bios.farcaster_handle,
          telegram_handle: statement.delegate_bios.telegram_handle,
          email: statement.delegate_bios.email,
          website: statement.delegate_bios.website,
          github_handle: statement.delegate_bios.github_handle,
          email_verified: statement.delegate_bios.email_verified,
          open_to_delegation: statement.delegate_bios.open_to_delegation,
          open_to_proposals: statement.delegate_bios.open_to_proposals,
          open_to_questions: statement.delegate_bios.open_to_questions,
          agreed_to_code_of_conduct:
            statement.delegate_bios.agreed_to_code_of_conduct,
          created_at: statement.delegate_bios.created_at,
          updated_at: statement.delegate_bios.updated_at,
        },
      },
    };
    return NextResponse.json(response, { status: 200 });
  }
}
