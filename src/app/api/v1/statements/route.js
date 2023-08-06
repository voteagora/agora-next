import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const statements = await prisma.delegate_statements.findMany({
    where: { token: process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN },
    include: {
      delegate_bios: true,
    },
  });

  // Build out proposal response
  const response = {
    statement: statements.map((statement) => ({
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
    })),
  };

  return NextResponse.json(response);
}

export async function POST(request) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }
  const prisma = new PrismaClient();

  const data = await request.json();

  const {
    title,
    content,
    twitter_handle,
    discord_handle,
    farcaster_handle,
    telegram_handle,
    email,
    website,
    github_handle,
    email_verified,
    open_to_delegation,
    open_to_proposals,
    open_to_questions,
    agreed_to_code_of_conduct,
  } = data;

  // Attempt to create the new statement in the database
  try {
    const statement = await prisma.delegate_statements.create({
      data: {
        address: title,
        statement: content,
        twitter_handle: twitter_handle,
        discord_handle: discord_handle,
        farcaster_handle: farcaster_handle,
        telegram_handle: telegram_handle,
        email: email,
        website: website,
        github_handle: github_handle,
        email_verified: email_verified,
        open_to_delegation: open_to_delegation,
        open_to_proposals: open_to_proposals,
        open_to_questions: open_to_questions,
        agreed_to_code_of_conduct: agreed_to_code_of_conduct,
        token: process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        delegate_bios: true,
      },
    });

    // Send the created statement back in the response
    return NextResponse.json(statement, { status: 201 });
  } catch (error) {
    console.error(error);
    // Handle any errors that occurred when trying to save to the database
    return NextResponse.json(
      {
        message: "An error occured trying to save the statement",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
