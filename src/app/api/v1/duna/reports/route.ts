import { NextRequest, NextResponse } from "next/server";
import { fetchForumTopics, addForumTopic, addForumPost } from "@/app/api/common/forum/getForum";
import { z } from "zod";

const createReportSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data since we can't access the database
    const mockTopics = [
      {
        id: 1,
        title: "Q1 2024 Financial Report",
        address: "0x1234...5678",
        createdAt: "2024-01-15T10:00:00Z",
        posts: [
          {
            id: 1,
            content: "This is the Q1 2024 financial report content. It includes detailed analysis of our financial performance, revenue growth, and strategic initiatives for the quarter.",
            address: "0x1234...5678",
            createdAt: "2024-01-15T10:00:00Z",
          }
        ]
      },
      {
        id: 2,
        title: "Q2 2024 Financial Report",
        address: "0x5678...9012",
        createdAt: "2024-04-15T10:00:00Z",
        posts: [
          {
            id: 2,
            content: "Q2 2024 showed strong growth in our core metrics. Revenue increased by 25% compared to Q1, and we successfully launched three new product features.",
            address: "0x5678...9012",
            createdAt: "2024-04-15T10:00:00Z",
          }
        ]
      },
      {
        id: 3,
        title: "Q3 2024 Financial Report",
        address: "0x9012...3456",
        createdAt: "2024-07-15T10:00:00Z",
        posts: [
          {
            id: 3,
            content: "Q3 2024 continued our momentum with record-breaking performance. We achieved 40% user growth and expanded into two new markets.",
            address: "0x9012...3456",
            createdAt: "2024-07-15T10:00:00Z",
          }
        ]
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: mockTopics,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createReportSchema.parse(body);

    // For now, return a mock response since we can't access the database
    const mockTopic = {
      id: Date.now(),
      title: validatedData.title,
      address: "anonymous",
      createdAt: new Date().toISOString(),
    };

    const mockPost = {
      id: Date.now() + 1,
      content: validatedData.content,
      address: "anonymous",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      topic: mockTopic,
      post: mockPost,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
} 