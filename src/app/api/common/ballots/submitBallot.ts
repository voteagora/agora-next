import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import verifyMessage from "@/lib/serverVerifyMessage";
import { prismaWeb2Client } from "@/app/lib/web2";
import {
  MetricsBallotSubmission,
  ProjectsBallotSubmission,
} from "../../v1/retrofunding/rounds/[roundId]/ballots/[ballotCasterAddressOrEns]/submit/route";

const submitBallotApi = async (
  data: MetricsBallotSubmission | ProjectsBallotSubmission,
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
  data: MetricsBallotSubmission | ProjectsBallotSubmission;
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

  const submission = await prismaWeb2Client.ballotSubmittions.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      signature: data.signature,
      payload,
      updated_at: new Date(),
    },
    create: {
      round: roundId,
      address,
      signature: data.signature,
      payload,
    },
  });

  return submission;
}

export const submitBallot = cache(submitBallotApi);
