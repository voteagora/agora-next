"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { getBlockScanUrl, getBlockScanAddress } from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

const generateDecodingMetadata = async (calldata: `0x${string}`) => {
  const signatureFromLookup = await lookupFunction(calldata.slice(0, 10));
  const args = decodeArgsWithSignature(
    signatureFromLookup as string,
    trimFunctionSelector(ethers.getBytes(calldata))
  );

  return args;
};

const ProposalTransactionDisplay = ({
  targets,
  calldatas,
  values,
  descriptions,
  executedTransactionHash,
  simulationDetails,
}: {
  targets: string[];
  calldatas: `0x${string}`[];
  values: string[];
  descriptions?: string[];
  executedTransactionHash?: string | null;
  simulationDetails?: {
    id?: string | null;
    state?: string | null;
  };
}) => {
  const [collapsed, setCollapsed] = useState(true);

  if (targets.length === 0) {
    return (
      <div>
        <div className="flex flex-col border rounded-lg border-line bg-wash p-4 text-xs text-secondary font-mono break-words overflow-hidden">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-tertiary">Proposed transactions</span>
          </div>
          <div className="text-xs text-tertiary mt-1">
            This proposal does not execute any transactions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col border border-b-0 rounded-t-lg border-line bg-wash p-4 text-xs text-secondary font-mono break-words overflow-hidden">
        <div className="w-full flex items-center justify-between">
          <span className="text-xs text-tertiary">Proposed transactions</span>
          {executedTransactionHash && (
            <a
              href={getBlockScanUrl(executedTransactionHash)}
              target="_blank"
              rel="noreferrer noopener"
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
            </a>
          )}
          {simulationDetails?.id && simulationDetails?.state && (
            <>
              {simulationDetails.state === "UNCONFIRMED" ? (
                <div className="bg-tertiary/20 text-secondary rounded-lg px-2 py-1 text-xs flex items-center gap-x-1">
                  <span>Simulation {simulationDetails.state}</span>
                </div>
              ) : (
                <a
                  href={`https://dashboard.tenderly.co/shared/simulation/${simulationDetails.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`
                ${simulationDetails.state === "VALID" ? "bg-positive/20 hover:bg-positive/30 text-positive" : simulationDetails.state === "INVALID" ? "bg-negative/20 hover:bg-negative/30 text-negative" : "bg-wash text-secondary"}
                transition-colors cursor-pointer rounded-lg px-2 py-1 text-xs flex items-center gap-x-1`}
                >
                  <span>Simulation {simulationDetails.state}</span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                </a>
              )}
            </>
          )}
        </div>

        {(collapsed ? [targets[0]] : targets).map((target, idx) => (
          <ProposalTransactionItem
            key={idx}
            target={target}
            calldata={calldatas[idx]}
            value={values[idx]}
            description={descriptions?.[idx]}
            collapsed={collapsed}
          />
        ))}
      </div>
      <div
        className="border border-line rounded-b-lg bg-wash p-4 cursor-pointer text-xs text-tertiary font-mono"
        onClick={() => {
          setCollapsed(!collapsed);
        }}
      >
        {collapsed ? "Expand transactions" : "Collapse transactions"}
      </div>
    </div>
  );
};

const ProposalTransactionItem = ({
  target,
  calldata,
  value,
  description,
  collapsed,
}: {
  target: string;
  calldata: `0x${string}`;
  value: string;
  description?: string;
  collapsed: boolean;
}) => {
  const [decodingMetadata, setDecodingMetadata] = useState<any>(null);

  useEffect(() => {
    if (calldata === "0x" || !calldata) {
      return;
    }

    generateDecodingMetadata(calldata).then((metadata) => {
      setDecodingMetadata(metadata);
    });
  }, [calldata]);

  return (
    <div className="mt-4">
      {description && (
        <div className="text-tertiary">{`// ${description}`}</div>
      )}
      <a
        className="underline"
        href={getBlockScanAddress(target)}
        target="_blank"
        rel="noreferrer noopener"
      >
        {target}
      </a>
      {(() => {
        if (!value) return;
        const bigValue = BigInt(value);
        if (bigValue === 0n && !calldata) {
          return;
        }

        return (
          <>
            {bigValue === 0n
              ? ""
              : ".transfer( " + ethers.formatEther(bigValue) + " ETH )"}
          </>
        );
      })()}
      <div className="flex flex-col ml-4">
        {(() => {
          if (!decodingMetadata) {
            if (calldata === "0x") {
              return null;
            }

            return (
              <>
                calldata:
                <div className="line-clamp-2">{calldata}</div>
              </>
            );
          }

          return (
            <>
              .{decodingMetadata.functionFragment.name}(
              <div className="flex flex-col ml-4">
                {(() => {
                  if (!value) return;
                  const bigValue = BigInt(value);
                  if (bigValue !== 0n) {
                    return <div>{ethers.formatEther(value)} ETH</div>;
                  }
                })()}
                {decodingMetadata.values.map((it: any, idx: number) => (
                  <EncodedValueDisplay
                    key={idx}
                    type={it.type}
                    value={it.value}
                    collapsed={collapsed}
                  />
                ))}
              </div>
              )
            </>
          );
        })()}
      </div>
    </div>
  );
};

function EncodedValueDisplay({
  type,
  value,
  collapsed,
}: {
  type: ethers.ParamType;
  value: any;
  collapsed: boolean;
}) {
  switch (type.type) {
    case "address":
      return (
        <a
          className="underline mr-4"
          href={getBlockScanAddress(value)}
          target="_blank"
          rel="noreferrer noopener"
        >
          {value},
        </a>
      );

    case "tuple":
      return (
        <div className="flex flex-col mr-4">
          {type?.components?.map((compoment, idx) => (
            <EncodedValueDisplay
              key={idx}
              type={compoment}
              value={value[idx]}
              collapsed={collapsed}
            />
          ))}
        </div>
      );

    case "bytes":
      return <NestedFunctionDisplay calldata={value} collapsed={collapsed} />;

    default:
    case "string":
    case "uint16":
    case "uint32":
    case "uint64":
    case "uint128":
    case "uint256":
      return <div className="ml-4">{value.toString()},</div>;
  }
}

function MultiSendDisplay({
  calldata,
  collapsed,
}: {
  calldata: string;
  collapsed: boolean;
}) {
  const transactions = useMemo(() => {
    try {
      return decodeMultiSend(Buffer.from(ethers.getBytes(calldata)));
    } catch (e) {
      return null;
    }
  }, [calldata]);

  if (!transactions) {
    return <div className="line-clamp-2">{calldata}</div>;
  }

  return (
    <div className="flex flex-col">
      {collapsed ? (
        <div className="line-clamp-2">{calldata}</div>
      ) : (
        transactions.map((tx, idx) => (
          <EncodedValueDisplay
            key={idx}
            type={ethers.ParamType.from("bytes")}
            value={tx.data}
            collapsed={collapsed}
          />
        ))
      )}
    </div>
  );
}

function NestedFunctionDisplay({
  calldata,
  collapsed,
}: {
  calldata: any;
  collapsed: boolean;
}) {
  const [decodingMetadata, setDecodingMetadata] = useState<any>(null);

  useEffect(() => {
    if (calldata === "0x") {
      return;
    }

    generateDecodingMetadata(calldata).then((metadata) => {
      setDecodingMetadata(metadata);
    });
  }, [calldata]);

  if (!decodingMetadata) {
    return <div>{calldata}</div>;
  }

  if (decodingMetadata.functionFragment.name === "multiSend") {
    return (
      <div className="ml-4">
        {decodingMetadata.functionFragment.name}(
        <MultiSendDisplay
          calldata={decodingMetadata.values[0].value}
          collapsed={collapsed}
        />
        )
      </div>
    );
  }

  return (
    <div className="ml-4">
      {decodingMetadata.functionFragment.name}(
      <div className="flex flex-col">
        {decodingMetadata.values.map((it: any, idx: number) => (
          <EncodedValueDisplay
            key={idx}
            type={it.type}
            value={it.value}
            collapsed={collapsed}
          />
        ))}
      </div>
      ),
    </div>
  );
}

export default ProposalTransactionDisplay;

// ---------------
// fetching helpers
// ---------------

const BASE_URL = "https://api.openchain.xyz/signature-database/v1/";

type FunctionLookupResult = {
  result: {
    function: {
      [fn: string]: [
        {
          name: string;
        },
      ];
    };
  };
};

export async function lookupFunction(fn: string) {
  const url = `${BASE_URL}lookup?function=${fn}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = (await response.json()) as FunctionLookupResult;

    if (payload.result.function[fn]) {
      return payload.result.function[fn][0].name;
    }

    return null;
  } catch (e) {
    console.error(e);

    return null;
  }
}

function decodeArgsWithSignature(signature: string, calldata: Uint8Array) {
  const functionFragment = ethers.FunctionFragment.from(signature);

  const decoder = new ethers.AbiCoder();
  const decoded = decoder.decode(functionFragment.inputs, calldata);

  return {
    functionFragment,
    values: functionFragment.inputs.map((type, index) => ({
      type,
      value: decoded[index],
    })),
  };
}

function trimFunctionSelector(bytes: Uint8Array) {
  return bytes.slice(4);
}
function decodeMultiSend(encodedTransactions: Buffer) {
  const transactions = [];
  let offset = 0;

  while (offset < encodedTransactions.length) {
    // Read the operation, which is a uint8 at the current offset
    const operation = encodedTransactions.readUInt8(offset);
    offset += 1;

    // Read the "to" address, which is 20 bytes. Addresses are represented as 40-character hex strings.
    const to =
      "0x" + encodedTransactions.slice(offset, offset + 20).toString("hex");
    offset += 20;

    // Read the "value", which is a uint256 (32 bytes)
    const value = BigInt(
      "0x" + encodedTransactions.slice(offset, offset + 32).toString("hex")
    );
    offset += 32;

    // Read the data length, which is also a uint256 (32 bytes)
    const dataLength = Number(
      BigInt(
        "0x" + encodedTransactions.slice(offset, offset + 32).toString("hex")
      )
    );
    offset += 32;

    // Read the data, which is a variable-length bytes array
    const data =
      "0x" +
      encodedTransactions.slice(offset, offset + dataLength).toString("hex");
    offset += dataLength;

    // Push the decoded transaction to the transactions array
    transactions.push({ operation, to, value, data });
  }

  return transactions;
}
