import { PROFILE_IMAGE_CONTENT_TYPES } from "@/lib/profileImage";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FORUM_ATTACHMENT_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/json",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export const ALLOWED_INLINE_IMAGE_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export const ALLOWED_PROFILE_IMAGE_CONTENT_TYPES = new Set<string>(
  PROFILE_IMAGE_CONTENT_TYPES
);

const DEFAULT_UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_INLINE_IMAGE_UPLOADS = 20;
const DEFAULT_MAX_ATTACHMENT_UPLOADS = 10;
const DEFAULT_MAX_DOCUMENT_UPLOADS = 10;
const DEFAULT_MAX_PROFILE_IMAGE_UPLOADS = 10;

export type UploadRateLimitScope =
  | "inline-image"
  | "attachment"
  | "document"
  | "profile-image";

const uploadRateLimitBuckets = new Map<string, number[]>();

export function decodeBase64Upload(base64Data: string): Buffer {
  const content = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  return Buffer.from(content, "base64");
}

export function validateUploadBuffer(params: {
  buffer: Buffer;
  contentType: string;
  allowedContentTypes: ReadonlySet<string>;
  maxBytes?: number;
}): string | null {
  const {
    buffer,
    contentType,
    allowedContentTypes,
    maxBytes = MAX_UPLOAD_BYTES,
  } = params;

  if (!contentType || !allowedContentTypes.has(contentType)) {
    return "Unsupported file type";
  }

  if (buffer.length === 0) {
    return "Empty uploads are not allowed";
  }

  if (buffer.length > maxBytes) {
    return `File size exceeds the ${Math.floor(maxBytes / 1024 / 1024)}MB limit`;
  }

  return null;
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/**
 * Detect the image type from magic bytes so a declared content type can be
 * checked against the actual file contents. Returns null when unrecognized.
 */
export function sniffImageContentType(buffer: Buffer): string | null {
  if (buffer.length < 12) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return "image/png";
  }

  const gifHeader = buffer.subarray(0, 6).toString("latin1");
  if (gifHeader === "GIF87a" || gifHeader === "GIF89a") {
    return "image/gif";
  }

  if (
    buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
    buffer.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function validateUploadRateLimit(params: {
  address: string;
  scope: UploadRateLimitScope;
  maxUploads?: number;
  windowMs?: number;
}): string | null {
  const {
    address,
    scope,
    windowMs = DEFAULT_UPLOAD_WINDOW_MS,
    maxUploads = getDefaultUploadLimit(scope),
  } = params;

  const now = Date.now();
  const windowStart = now - windowMs;
  const bucketKey = `${scope}:${address.toLowerCase()}`;
  const recentUploads = (uploadRateLimitBuckets.get(bucketKey) || []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (recentUploads.length >= maxUploads) {
    uploadRateLimitBuckets.set(bucketKey, recentUploads);
    return "Upload rate limit exceeded. Please wait a few minutes and try again.";
  }

  recentUploads.push(now);
  uploadRateLimitBuckets.set(bucketKey, recentUploads);
  return null;
}

function getDefaultUploadLimit(scope: UploadRateLimitScope) {
  switch (scope) {
    case "inline-image":
      return DEFAULT_MAX_INLINE_IMAGE_UPLOADS;
    case "document":
      return DEFAULT_MAX_DOCUMENT_UPLOADS;
    case "profile-image":
      return DEFAULT_MAX_PROFILE_IMAGE_UPLOADS;
    case "attachment":
    default:
      return DEFAULT_MAX_ATTACHMENT_UPLOADS;
  }
}
