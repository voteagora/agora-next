import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import verifyMessage from "@/lib/serverVerifyMessage";

type BallotSubmission = {
  ballotContnet: {
    metric_id: string;
    allocation: number;
  }[];
  signature: `0x${string}`;
};

const submitBallotApi = async (
  data: BallotSubmission,
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
  data: BallotSubmission;
  roundId: number;
  address: string;
}) {
  const payload = JSON.stringify(data.ballotContnet);

  const isSignatureValid = await verifyMessage({
    address: address as `0x${string}`,
    message: payload,
    signature: data.signature,
  });

  // TODO: Validate ballot content

  if (!isSignatureValid) {
    throw new Error("Invalid signature");
  }

  const submission = await prisma.ballotSubmittions.update({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    data: {
      signature: data.signature,
      payload,
      updated_at: new Date(),
    },
  });

  return submission;
}

export const submitBallot = cache(submitBallotApi);
