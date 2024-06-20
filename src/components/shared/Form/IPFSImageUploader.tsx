import React, { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFileToPinata } from "@/lib/pinata";

const pinFileToIPFS = async (
  file: File,
  setIpfsHash: React.Dispatch<React.SetStateAction<string>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const ipfsHash = await uploadFileToPinata(file);
    setIpfsHash(ipfsHash);
  } catch (error) {
    console.error(error);
  } finally {
    setIsUploading(false);
  }
};

interface IPFSImageUploaderProps {
  setIpfsHash: React.Dispatch<React.SetStateAction<string>>;
}

const IPFSImageUploader: React.FC<IPFSImageUploaderProps> = ({
  setIpfsHash,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [localIpfsHash, setLocalIpfsHash] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    pinFileToIPFS(
      file,
      (hash) => {
        setIpfsHash(hash);
        setLocalIpfsHash(hash);
      },
      setIsUploading
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <Label htmlFor="picture">Picture</Label>
          <Input
            id="picture"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? "Uploading..." : "Upload to IPFS"}
        </Button>
      </div>
      {localIpfsHash && (
        <p>
          IPFS Hash:{" "}
          <a
            href={`https://op-atlas-test.mypinata.cloud/ipfs/${localIpfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {localIpfsHash}
          </a>
        </p>
      )}
    </div>
  );
};

export default IPFSImageUploader;
