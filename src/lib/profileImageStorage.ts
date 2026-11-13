import "server-only";

import { randomUUID } from "crypto";
import { Storage } from "@google-cloud/storage";

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

const PROFILE_IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

let storageClient: Storage | null = null;

function getStorage(): Storage {
  if (storageClient) {
    return storageClient;
  }

  const rawKey = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    const credentials = JSON.parse(rawKey) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (credentials.private_key) {
      // Dashboards sometimes store the key with escaped newlines
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
    storageClient = new Storage({
      projectId: credentials.project_id,
      credentials,
    });
  } else {
    // Application Default Credentials (gcloud auth application-default login)
    storageClient = new Storage();
  }

  return storageClient;
}

function getBucketName(): string {
  const bucket = process.env.PROFILE_IMAGE_GCP_BUCKET;
  if (!bucket) {
    throw new Error("PROFILE_IMAGE_GCP_BUCKET is missing from env");
  }
  return bucket;
}

export function getProfileImageUrl(objectName: string): string {
  const baseUrl = process.env.PROFILE_IMAGE_TWICPIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("PROFILE_IMAGE_TWICPIC_BASE_URL is missing from env");
  }
  return `${baseUrl.replace(/\/+$/, "")}/${objectName}`;
}

export async function uploadProfileImage(
  buffer: Buffer,
  contentType: string,
  address: string
): Promise<string> {
  const extension = EXTENSION_BY_CONTENT_TYPE[contentType];
  if (!extension) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Unique object names so TwicPics' long-lived cache never serves a stale image
  const objectName = `profile-images/${address.toLowerCase()}/${randomUUID()}.${extension}`;

  await getStorage()
    .bucket(getBucketName())
    .file(objectName)
    .save(buffer, {
      contentType,
      resumable: false,
      metadata: {
        cacheControl: PROFILE_IMAGE_CACHE_CONTROL,
      },
    });

  return objectName;
}
