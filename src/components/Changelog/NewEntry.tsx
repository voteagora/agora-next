"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/shared/Markdown/MarkdownEditor";
import { Button } from "@/components/Button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { Separator } from "@/components/ui/separator";
import IPFSImageUploader from "@/components/shared/Form/IPFSImageUploader"; // Adjust the import path as necessary

export default function NewEntry() {
  const { contracts } = Tenant.current();

  const options = [
    { name: "https://vote.optimism.io", value: "https://vote.optimism.io" },
    { name: "https://agora.ensdao.org/", value: "https://agora.ensdao.org/" },
    { name: "https://vote.ether.fi/", value: "https://vote.ether.fi/" },
    {
      name: "https://vote.uniswapfoundation.org/",
      value: "https://vote.uniswapfoundation.org/",
    },
  ];

  const changelogContract = {
    address: contracts.changelog!.address as `0x${string}`,
    abi: contracts.changelog!.abi,
    chainId: contracts.changelog!.chain.id,
  };

  const { address: accountAddress } = useAccount();

  const [title, setTitle] = useState("");
  const [markdownText, setMarkdownText] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [tag, setTag] = useState("");
  const [projectURL, setProjectURL] = useState("https://vote.optimism.io");
  const [createdAt, setCreatedAt] = useState<number>(
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    setCreatedAt(Math.floor(Date.now() / 1000));
  }, []);

  const { config: createEntryConfig, isError: createEntryError } =
    usePrepareContractWrite({
      ...changelogContract,
      functionName: "addEntry",
      args: [title, markdownText, ipfsHash, tag, projectURL, BigInt(createdAt)],
    });

  const {
    data: resultCreateEntry,
    write: writeCreateEntry,
    isLoading: isLoadingCreateEntry,
  } = useContractWrite(createEntryConfig);

  const { isLoading: isLoadingCreateEntryTransaction } = useWaitForTransaction({
    hash: resultCreateEntry?.hash,
  });

  const isDisabledCreateEntry =
    isLoadingCreateEntry || isLoadingCreateEntryTransaction || createEntryError;

  return (
    <div className="gl_box">
      <section>
        <h1 className="font-extrabold text-2xl">Create Changelog Entry</h1>
        <p>Add a new entry to the changelog</p>
      </section>
      <div className="space-y-8 my-4">
        <div className="space-y-4">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isDisabledCreateEntry}
            type="text"
          />
        </div>
        <div className="space-y-4">
          <Label>Tag</Label>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={isDisabledCreateEntry}
            type="text"
          />
        </div>
        <div className="space-y-4">
          <MarkdownEditor
            value={markdownText}
            onChange={setMarkdownText}
            title="Changelog update"
            placeholder="I believe that..."
            disabled={isDisabledCreateEntry}
          />
        </div>
        <div className="space-y-4">
          <Label>Header Image (Optional)</Label>
          <IPFSImageUploader setIpfsHash={setIpfsHash} />
        </div>
        <div className="space-y-4">
          <Label>Project URL</Label>
          <Select
            value={projectURL}
            onValueChange={(value) => setProjectURL(value)}
            defaultValue={"0"}
            disabled={isDisabledCreateEntry}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={"Which project"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((item, index) => (
                <SelectItem key={index} value={item.value}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator className="my-8" />
        <Button
          variant="outline"
          size="sm"
          loading={isDisabledCreateEntry}
          disabled={isDisabledCreateEntry}
          onClick={() => {
            writeCreateEntry?.();
          }}
        >
          Create Entry
        </Button>
      </div>
    </div>
  );
}
