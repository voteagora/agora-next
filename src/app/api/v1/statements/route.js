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

  const { title, content, bio, token, created_at, updated_at } = data

  // Attempt to create the new statement in the database
  try {
    const statement = await prisma.delegate_statements.create({
      data: {
        address: title,
        statement: content,
        bio: bio,
        token: token,
        created_at: created_at,
        updated_at: updated_at,
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
