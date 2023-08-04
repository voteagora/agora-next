import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request, { params }) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  // update to capture all the relevant fields from the updated form
  const proposal = await prisma.delegate_statements.create({
    data: {
      // include all the fields from the `delegate_statements` and `delegate_bios` definitions
      id: formData.id,
      address: formData.address,
      statement: formData.statement,
      token: formData.token,
      created_at: formData.created_at,
      updated_at: formData.updated_at,
      delegate_bios: {
        create: {
          id: formData.delegate_bios.id,
          delegate_statement_id: formData.delegate_bios.delegate_statement_id,
          address: formData.delegate_bios.address,
          token: formData.delegate_bios.token,
          signature_data: formData.delegate_bios.signature_data,
          twitter_handle: formData.delegate_bios.twitter_handle,
          discord_handle: formData.delegate_bios.discord_handle,
          farcaster_handle: formData.delegate_bios.farcaster_handle,
          telegram_handle: formData.delegate_bios.telegram_handle,
          email: formData.delegate_bios.email,
          website: formData.delegate_bios.website,
          github_handle: formData.delegate_bios.github_handle,
          email_verified: formData.delegate_bios.email_verified,
          open_to_delegation: formData.delegate_bios.open_to_delegation,
          open_to_proposals: formData.delegate_bios.open_to_proposals,
          open_to_questions: formData.delegate_bios.open_to_questions,
          agreed_to_code_of_conduct: formData.delegate_bios.agreed_to_code_of_conduct,
          created_at: formData.delegate_bios.created_at,
          updated_at: formData.delegate_bios.updated_at,
        },
      },
    },
  });

  // Build out proposal response
  const response = {
    statement: {
      // Just testing out, not meant for production
      id: proposal.id,
    },
  };

  return NextResponse.json(response);
}
