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

const DEFAULT_UPLOAD_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_INLINE_IMAGE_UPLOADS = 20;
const DEFAULT_MAX_ATTACHMENT_UPLOADS = 10;
const DEFAULT_MAX_DOCUMENT_UPLOADS = 10;

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

export function validateUploadRateLimit(params: {
  address: string;
  scope: "inline-image" | "attachment" | "document";
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

function getDefaultUploadLimit(scope: "inline-image" | "attachment" | "document") {
  switch (scope) {
    case "inline-image":
      return DEFAULT_MAX_INLINE_IMAGE_UPLOADS;
    case "document":
      return DEFAULT_MAX_DOCUMENT_UPLOADS;
    case "attachment":
    default:
      return DEFAULT_MAX_ATTACHMENT_UPLOADS;
  }
}
