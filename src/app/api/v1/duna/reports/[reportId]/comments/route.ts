import { NextRequest, NextResponse } from "next/server";
import { addForumPost } from "@/app/api/common/forum/getForum";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  parentId: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const reportId = parseInt(params.reportId);
    
    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: "Invalid report ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Mock response for testing
    const mockPost = {
      id: Date.now(),
      address: "anonymous",
      content: validatedData.content,
      createdAt: new Date().toISOString(),
      parentPostId: validatedData.parentId,
    };

    return NextResponse.json({
      success: true,
      post: mockPost,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
} 