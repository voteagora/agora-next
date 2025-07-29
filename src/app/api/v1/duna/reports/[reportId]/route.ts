import { NextRequest, NextResponse } from "next/server";
import { fetchForumTopic, fetchForumPosts } from "@/app/api/common/forum/getForum";

export async function GET(
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

    // Mock data for testing
    const mockTopic = {
      id: reportId,
      title: `Q${reportId} 2024 Financial Report`,
      address: "0x1234...5678",
      createdAt: "2024-01-15T10:00:00Z",
    };

    const mockPosts = [
      {
        id: 1,
        content: `This is the detailed content for Q${reportId} 2024 financial report. It includes comprehensive analysis of our financial performance, revenue growth, and strategic initiatives for the quarter.`,
        address: "0x1234...5678",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        content: "Great report! The growth metrics look promising.",
        address: "0x5678...9012",
        createdAt: "2024-01-16T10:00:00Z",
      },
      {
        id: 3,
        content: "I agree with the analysis. The strategic initiatives seem well-planned.",
        address: "0x9012...3456",
        createdAt: "2024-01-17T10:00:00Z",
      }
    ];

    return NextResponse.json({
      success: true,
      topic: mockTopic,
      posts: mockPosts,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
} 