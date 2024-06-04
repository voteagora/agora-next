"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select"; // Assuming you have a Select component
import { useEffect, useState } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { Separator } from "@/components/ui/separator";

export default function NewEntry() {
  const { contracts } = Tenant.current();

  const changelogContract = {
    address: contracts.changelog!.address as `0x${string}`,
    abi: contracts.changelog!.abi,
    chainId: contracts.changelog!.chain.id,
  };

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
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:gap-4">
          <div className="flex-1">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isDisabledCreateEntry}
              type="text"
            />
          </div>
          <div className="flex-1">
            <Label>Tag</Label>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              disabled={isDisabledCreateEntry}
              type="text"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label>Markdown Text</Label>
          <Textarea
            value={markdownText}
            onChange={(e) => setMarkdownText(e.target.value)}
            disabled={isDisabledCreateEntry}
          />
        </div>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:gap-4">
          <div className="flex-1">
            <Label>IPFS Hash</Label>
            <Input
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              disabled={isDisabledCreateEntry}
              type="text"
            />
          </div>
          <div className="flex-1">
            <Label>Project URL</Label>
            <select
              value={projectURL}
              onChange={(e) => setProjectURL(e.target.value)}
              disabled={isDisabledCreateEntry}
              className="input"
            >
              <option value="https://vote.optimism.io">
                https://vote.optimism.io
              </option>
              <option value="https://agora.ensdao.org/">
                https://agora.ensdao.org/
              </option>
              <option value="https://vote.ether.fi/">
                https://vote.ether.fi/
              </option>
              <option value="https://vote.uniswapfoundation.org/">
                https://vote.uniswapfoundation.org/
              </option>
            </select>
          </div>
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
