const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  console.warn("Pinata API credentials not found in environment variables");
}

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
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT not configured");
  }

  const formData = new FormData();

  if (file instanceof File) {
    formData.append("file", file);
  } else {
    // Handle Buffer
    const blob = new Blob([file]);
    formData.append("file", blob);
  }

  if (metadata) {
    formData.append("pinataMetadata", JSON.stringify(metadata));
  }

  if (options) {
    formData.append("pinataOptions", JSON.stringify(options));
  }

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export function getIPFSUrl(ipfsHash: string, gateway?: string): string {
  const defaultGateway = "https://gateway.pinata.cloud";
  const baseUrl = gateway || defaultGateway;
  return `${baseUrl}/ipfs/${ipfsHash}`;
}
