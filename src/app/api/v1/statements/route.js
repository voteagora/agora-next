import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }

  const statement = await prisma.delegate_statements.findOne({
    where: {
      id: 1,
    }
  });

  // Build out proposal response
  const response = {
    statement: events.map((event) => ({
      // Just testing out, not meant for production
      id: event.id,
      kind: event.kind,
      event_data: event.event_data,
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

  const { title, content, twitter_handle, discord_handle, farcaster_handle, telegram_handle, email, website, github_handle, email_verified, open_to_delegation, open_to_proposals, open_to_questions, agreed_to_code_of_conduct } = data

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
        token: "NOUN",
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
