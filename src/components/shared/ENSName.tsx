"use client";

import { useEffect, useRef, useState } from "react";
import { useEnsName } from "wagmi";
import { truncateAddress } from "@/app/lib/utils/text";

interface ENSNameProps {
  address: string;
  truncate?: boolean;
  // When true, defer ENS reverse lookup until the component is visible
  lazy?: boolean;
}

// Displays ENS reverse record for an address with lazy-loading to limit lookups.
export default function ENSName({
  address,
  truncate = true,
  lazy = true,
}: ENSNameProps) {
  const [ensName, setEnsName] = useState(
    truncate ? truncateAddress(address || "") : address || ""
  );
  const [isInView, setIsInView] = useState(!lazy);
  const ref = useRef<HTMLSpanElement | null>(null);

  // Observe visibility to enable the ENS query lazily
  useEffect(() => {
    if (!lazy) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy]);

  const { data } = useEnsName({
    chainId: 1,
    address: address as `0x${string}`,
    query: {
      enabled: isInView,
      staleTime: 1000 * 60 * 60 * 24, // cache for a day
    },
  });

  useEffect(() => {
    if (data) {
      setEnsName(data);
    } else {
      setEnsName(truncate ? truncateAddress(address) : address);
    }
  }, [data, address, truncate]);

  return (
    <span ref={ref}>
      {truncate
        ? ensName || `${address.slice(0, 6)}...${address.slice(-4)}`
        : ensName || address}
    </span>
  );
}
