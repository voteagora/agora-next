import { PinataSDK } from "pinata";

if (!process.env.PINATA_JWT) {
  throw new Error("PINATA_JWT is missing from env");
}

const GATEWAY_URL = "bronze-abundant-swift-398.mypinata.cloud";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: GATEWAY_URL,
});

export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface PinataMetadata {
  name?: string;
  keyvalues?: Record<string, string | number>;
}

export interface PinataOptions {
  cidVersion?: 0 | 1;
  wrapWithDirectory?: boolean;
  customPinPolicy?: {
    regions: Array<{
      id: string;
      desiredReplicationCount: number;
    }>;
  };
}

export async function uploadFileToPinata(
  file: File | Buffer,
  metadata?: PinataMetadata,
  options?: PinataOptions
): Promise<PinataUploadResponse> {
  let uploadBuilder;

  if (Buffer.isBuffer(file)) {
    const base64 = file.toString("base64");
    uploadBuilder = pinata.upload.public.base64(base64);
  } else {
    uploadBuilder = pinata.upload.public.file(file as File);
  }

  if (metadata?.name) {
    uploadBuilder = uploadBuilder.name(metadata.name);
  }

  if (metadata?.keyvalues) {
    const stringKeyvalues = Object.entries(metadata.keyvalues).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>
    );
    uploadBuilder = uploadBuilder.keyvalues(stringKeyvalues);
  }

  const res = await uploadBuilder;

  return {
    IpfsHash: res.cid,
    PinSize: res.size,
    Timestamp: res.created_at,
  };
}

export function getIPFSUrl(ipfsHash: string): string {
  return `https://${GATEWAY_URL}/ipfs/${ipfsHash}`;
}
