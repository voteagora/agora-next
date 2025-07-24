import { NextRequest, NextResponse } from "next/server";
import { uploadFileToPinata } from "@/lib/pinata";
import { addForumAttachment } from "@/app/api/common/forum/getForum";
import { withMetrics } from "@/lib/metricWrapper";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/json",
  "text/markdown",
  "text/csv",
];

export async function POST(request: NextRequest) {
  return withMetrics("uploadForumAttachment", async () => {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const address = formData.get("address") as string;
      const targetType = formData.get("targetType") as "topic" | "post";
      const targetId = formData.get("targetId") as string;

      // Validation
      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      if (!address || !targetType || !targetId) {
        return NextResponse.json(
          {
            error: "Missing required parameters: address, targetType, targetId",
          },
          { status: 400 }
        );
      }

      if (!["topic", "post"].includes(targetType)) {
        return NextResponse.json(
          { error: "targetType must be 'topic' or 'post'" },
          { status: 400 }
        );
      }

      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          { status: 400 }
        );
      }

      // File type validation
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Upload to Pinata
      const pinataMetadata = {
        name: file.name,
        keyvalues: {
          type: "forum-attachment",
          targetType,
          targetId: parseInt(targetId),
          uploadedBy: address,
          contentType: file.type,
          size: file.size,
        },
      };

      const pinataResponse = await uploadFileToPinata(file, pinataMetadata);

      // Create forum attachment record
      const attachment = await addForumAttachment({
        address,
        targetType,
        targetId: parseInt(targetId),
        ipfsCid: pinataResponse.IpfsHash,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      return NextResponse.json({
        success: true,
        attachment: {
          id: attachment.id,
          ipfsCid: pinataResponse.IpfsHash,
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          createdAt: attachment.createdAt,
          ipfsUrl: `https://gateway.pinata.cloud/ipfs/${pinataResponse.IpfsHash}`,
        },
      });
    } catch (error) {
      console.error("Error uploading forum attachment:", error);

      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Forum attachment upload endpoint",
      method: "POST",
      maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      allowedTypes: ALLOWED_FILE_TYPES,
      requiredFields: ["file", "address", "targetType", "targetId"],
    },
    { status: 200 }
  );
}
