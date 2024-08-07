import { NextRequest, NextResponse } from "next/server";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import path from "path";

const MERKLE_TREES_DIR = "public/merkle-trees";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const treeName = searchParams.get("tree");

  if (!address || !treeName) {
    return NextResponse.json(
      { error: "Both address and tree parameters are required" },
      { status: 400 }
    );
  }

  try {
    const treeFilePath = path.join(
      process.cwd(),
      MERKLE_TREES_DIR,
      `${treeName}.json`
    );

    // Check if the file exists
    if (!fs.existsSync(treeFilePath)) {
      return NextResponse.json(
        { error: "Specified Merkle tree not found" },
        { status: 404 }
      );
    }

    // Load the Merkle tree
    const treeData = JSON.parse(fs.readFileSync(treeFilePath, "utf8"));
    const tree = StandardMerkleTree.load(treeData);

    let proof = null;
    let value = null;

    // Search for the address in the tree
    for (const [i, v] of tree.entries()) {
      if (v[0].toLowerCase() === address.toLowerCase()) {
        proof = tree.getProof(i);
        value = v[1];
        break;
      }
    }

    if (proof && value) {
      return NextResponse.json({ value, proof });
    } else {
      return NextResponse.json(
        { error: "Address not found in the specified Merkle tree" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
