import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import verifyMessage from "@/lib/serverVerifyMessage";
import prisma from "@/app/lib/prisma";
import {
  R4BallotSubmission,
  R5BallotSubmission,
} from "../../v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/submit/route";

const submitBallotApi = async (
  data: R4BallotSubmission | R5BallotSubmission,
  roundId: number,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(submitBallotForAddress, ballotCasterAddressOrEns, {
    data,
    roundId,
  });

async function submitBallotForAddress({
  data,
  roundId,
  address,
}: {
  data: R4BallotSubmission | R5BallotSubmission;
  roundId: number;
  address: string;
}) {
  const payload = JSON.stringify(data.ballot_content);

  const isSignatureValid = await verifyMessage({
    address: address as `0x${string}`,
    message: payload,
    signature: data.signature as `0x${string}`,
  });

  if (!isSignatureValid) {
    throw new Error("Invalid signature");
  }

  // The signature column in the schema is VARCHAR(255). EIP-1271 signatures
  // can be longer than that, so we truncate them to fit in the database.
  let signature = data.signature;
  if (signature.length > 255) {
    signature = signature.substring(0, 252) + "...";
  }

  const submission = await prisma.ballotSubmittions.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      signature: signature,
      payload,
      updated_at: new Date(),
    },
    create: {
      round: roundId,
      address,
      signature: signature,
      payload,
    },
  });

  return submission;
}

export const submitBallot = cache(submitBallotApi);
