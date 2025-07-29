import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const uploadDocumentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  fileSize: z.number().min(1, "File size is required"),
  contentType: z.string().min(1, "Content type is required"),
});

export async function GET(request: NextRequest) {
  // For now, return mock data since we haven't implemented document storage yet
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Q1 2024 Financial Report.pdf",
        url: "#",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        name: "Q2 2024 Financial Report.pdf",
        url: "#",
        createdAt: "2024-04-15T10:00:00Z",
      },
      {
        id: 3,
        name: "Q3 2024 Financial Report.pdf",
        url: "#",
        createdAt: "2024-07-15T10:00:00Z",
      },
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = uploadDocumentSchema.parse(body);

    // For now, just return a mock success response
    // In the future, this would upload to IPFS and store in the database
    return NextResponse.json({
      success: true,
      document: {
        id: Date.now(),
        name: validatedData.fileName,
        url: validatedData.fileUrl,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
} 