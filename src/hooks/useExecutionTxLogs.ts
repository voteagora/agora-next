import { useQuery } from "@tanstack/react-query";
import { type Abi, type Log, decodeEventLog, isHash } from "viem";
import { getPublicClient } from "@/lib/viem";
import { cachedGetContractAbi } from "@/lib/abiUtils";
import { getExecutionEventNameForLog } from "@/lib/execution/executionEventTopic0Names";
import { tryDecodeKnownExecutionLog } from "@/lib/execution/knownLogDecoders";
import Tenant from "@/lib/tenant/tenant";

export type DecodedExecutionLog = {
  logIndex: number;
  address: `0x${string}`;
  blockNumber: bigint;
  eventName: string | null;
  args: readonly unknown[] | Record<string, unknown> | null;
  byAbi: boolean;
  decodeSource: "contractAbi" | "knownAbi" | "nameOnly" | "none";
  raw: { topics: readonly `0x${string}`[]; data: `0x${string}` };
};

const abiCache = new Map<string, Abi | null>();

function getAbiKey(address: string, network: string) {
  return `${network.toLowerCase()}:${address.toLowerCase()}`;
}

async function getAbiFor(
  address: `0x${string}`,
  network: string
): Promise<Abi | null> {
  const key = getAbiKey(address, network);
  if (abiCache.has(key)) {
    return abiCache.get(key) ?? null;
  }
  const items = await cachedGetContractAbi(
    address,
    process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "",
    network
  );
  if (!items || !items.length) {
    abiCache.set(key, null);
    return null;
  }
  const abi = items as unknown as Abi;
  abiCache.set(key, abi);
  return abi;
}

function tryDecode(
  log: Log,
  abi: Abi
): {
  eventName: string;
  args: readonly unknown[] | Record<string, unknown>;
} | null {
  try {
    const d = decodeEventLog({
      abi,
      data: log.data,
      topics: log.topics,
      strict: false,
    });
    if (!d.eventName) {
      return null;
    }
    return {
      eventName: d.eventName,
      args: d.args as readonly unknown[] | Record<string, unknown>,
    };
  } catch {
    return null;
  }
}

export function useExecutionTxLogs(txHash: `0x${string}` | string) {
  const { contracts } = Tenant.current();
  const network = contracts.governor.chain.name;
  const valid = isHash(txHash as `0x${string}`);

  return useQuery({
    queryKey: ["executionTxLogs", network, txHash],
    queryFn: async () => {
      if (!isHash(txHash as `0x${string}`)) {
        throw new Error("Invalid transaction hash");
      }
      const client = getPublicClient();
      const [receipt, tx] = await Promise.all([
        client.getTransactionReceipt({ hash: txHash as `0x${string}` }),
        client.getTransaction({ hash: txHash as `0x${string}` }),
      ]);
      if (!receipt) {
        throw new Error("Transaction receipt not found");
      }
      const addrs = [
        ...new Set(receipt.logs.map((l) => l.address.toLowerCase())),
      ];
      const abiList = await Promise.all(
        addrs.map((a) => getAbiFor(a as `0x${string}`, network))
      );
      const addressToAbi = new Map<string, Abi | null>();
      for (let i = 0; i < addrs.length; i++) {
        addressToAbi.set(addrs[i]!, abiList[i]!);
      }

      const decoded: DecodedExecutionLog[] = [];
      for (const log of receipt.logs) {
        const raw = {
          topics: log.topics,
          data: log.data,
        };
        const knownDecoded = tryDecodeKnownExecutionLog(log as Log);
        if (knownDecoded) {
          decoded.push({
            logIndex: log.logIndex,
            address: log.address,
            blockNumber: log.blockNumber,
            eventName: knownDecoded.eventName,
            args: knownDecoded.args,
            byAbi: true,
            decodeSource: "knownAbi",
            raw,
          });
          continue;
        }

        const abi = addressToAbi.get(log.address.toLowerCase()) ?? null;
        if (abi) {
          const d = tryDecode(log as Log, abi);
          if (d) {
            decoded.push({
              logIndex: log.logIndex,
              address: log.address,
              blockNumber: log.blockNumber,
              eventName: d.eventName,
              args: d.args,
              byAbi: true,
              decodeSource: "contractAbi",
              raw,
            });
            continue;
          }
        }

        const nameFromTopic0 = getExecutionEventNameForLog(log);
        if (nameFromTopic0) {
          decoded.push({
            logIndex: log.logIndex,
            address: log.address,
            blockNumber: log.blockNumber,
            eventName: nameFromTopic0,
            args: null,
            byAbi: false,
            decodeSource: "nameOnly",
            raw,
          });
          continue;
        }

        decoded.push({
          logIndex: log.logIndex,
          address: log.address,
          blockNumber: log.blockNumber,
          eventName: null,
          args: null,
          byAbi: false,
          decodeSource: "none",
          raw,
        });
      }

      return { receipt, tx, logs: decoded };
    },
    enabled: valid,
    staleTime: Infinity,
  });
}
