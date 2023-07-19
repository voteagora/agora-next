import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser";

export async function GET(request) {
  return NextResponse.json({}, { status: 200 });
}
    
export async function POST(request) {
  // Check if the session is authenticated first
  const authResponse = authenticateAgoraApiUser(request);
  if (authResponse) {
    return authResponse;
  }
  const prisma = new PrismaClient();


  const data = await request.json();

  const { title, content } = data

  // Attempt to create the new statement in the database
  try {
    const statement = await prisma.delegate_statements.create({
      data: {
        address: title,
        statement: content,
        token: "NOUN",
        created_at: new Date(),
        updated_at: new Date(),
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
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
