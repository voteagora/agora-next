import { NextResponse } from "next/server";
import {
  EAS,
  NO_EXPIRATION,
  ZERO_BYTES32,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { EAS_V2_SCHEMA_IDS } from "@/lib/eas";
import Tenant from "@/lib/tenant/tenant";

const EAS_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
const PRIVATE_KEY = process.env.ATTESTATION_PRIVATE_KEY;
const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_ID;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { signature, attester, data, proposal_type_uid } = body;

    if (!signature || !attester || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: Missing attestation key" },
        { status: 500 }
      );
    }

    if (!ALCHEMY_ID) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Alchemy ID" },
        { status: 500 }
      );
    }

    const { contracts } = Tenant.current();
    const signer = new ethers.Wallet(PRIVATE_KEY, contracts.token.provider);
    const eas = new EAS(EAS_ADDRESS);
    eas.connect(signer as any);

    const tx = await eas.attestByDelegation({
      schema: EAS_V2_SCHEMA_IDS.CREATE_PROPOSAL,
      data: {
        recipient:
          contracts.easRecipient ||
          "0x0000000000000000000000000000000000000000",
        expirationTime: NO_EXPIRATION,
        revocable: true,
        refUID: proposal_type_uid || ZERO_BYTES32,
        data,
      },
      signature,
      attester,
      deadline: NO_EXPIRATION,
    });

    const newAttestationUID = await tx.wait();

    return NextResponse.json({
      success: true,
      uid: newAttestationUID,
    });
  } catch (error: any) {
    console.error("Error submitting delegated attestation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit attestation" },
      { status: 500 }
    );
  }
}
