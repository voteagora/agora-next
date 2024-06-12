import sdk from "@pinata/sdk";

if (
  !process.env.NEXT_PUBLIC_PINATA_API_KEY ||
  !process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY
) {
  throw new Error("PINATA_API_KEY or PINATA_SECRET_API_KEY missing from env");
}

const pinata = new sdk({
  pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataSecretApiKey: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
});

export async function testConnection() {
  const res = await pinata.testAuthentication();
  console.log("Pinata test response:", res);
}

export async function uploadToPinata(
  projectId: string,
  json: Record<string, unknown>
) {
  const res = await pinata.pinJSONToIPFS(json, {
    pinataMetadata: {
      name: "OPRetroFunding",
      projectID: projectId,
    },
  });

  console.info("Uploaded metadata to Pinata:", res);
  return res.IpfsHash;
}

export async function uploadFileToPinata(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const options = {
    pinataMetadata: JSON.stringify({
      name: file.name,
    }),
    pinataOptions: JSON.stringify({
      cidVersion: 1,
    }),
  };

  formData.append("pinataMetadata", options.pinataMetadata);
  formData.append("pinataOptions", options.pinataOptions);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`, // Use your JWT token here
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload file to Pinata: ${res.statusText}`);
    }

    const resData = await res.json();
    console.info("Uploaded file to Pinata:", resData);
    return resData.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
}
