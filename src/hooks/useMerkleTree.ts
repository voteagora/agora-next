"use client";

import { useQuery } from "@tanstack/react-query";

const fetchMerkleProof = async (address: string, tree: string) => {
  const response = await fetch(
    `/api/merkle-tree?address=${address}&tree=${tree}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Merkle proof");
  }
  return response.json();
};

export const MERKLE_TREE_QK = "merkleTree";

export const useMerkleTree = ({
  address,
  tree,
}: {
  address: string;
  tree: string;
}) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: [MERKLE_TREE_QK, address, tree],
    queryFn: async () => {
      return await fetchMerkleProof(address, tree);
    },
  });
  return { data, isFetching, isFetched };
};
