import { NextResponse } from "next/server";
import { prisma } from "src/app/lib/prisma";
import { authenticateAgoraApiUser } from "src/app/lib/middlewear/authenticateAgoraApiUser"

export async function GET(request) {



}

export async function POST(request) {

    // Check if the session is authenticated first
    const authResponse = authenticateAgoraApiUser(request);
    if (authResponse) {
        return authResponse;
    }

      const { title, content } = req.body;

      // Make sure title and content are provided
      if (!title || !content) {
        res.status(400).json({ error: "Title and content are required" });
        return;
      }

      // Attempt to create the new statement in the database
      try {
        const statement = await prisma.delegate_statements.create({
          data: {
            title,
            content,
          },
        });

        // Send the created statement back in the response
        res.status(201).json(statement);
      } catch (error) {
        console.error(error);

        // Handle any errors that occurred when trying to save to the database
        res
          .status(500)
          .json({
            error: "An error occurred while trying to save the statement",
          });
      }
    

}
