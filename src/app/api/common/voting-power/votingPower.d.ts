import {
  OptimismAdvancedVotingPower,
  OptimismVotingPower,
  OptimismVotingPowerSnaps,
} from "@prisma/client";

export type AdvancedVotingPowerPayload = OptimismAdvancedVotingPower;
export type VotingPowerPayload = OptimismVotingPower;

export type VotingPowerSnapsPayload = OptimismVotingPowerSnaps;

export type VotingPowerData = {
  directVP: string;
  advancedVP: string;
  totalVP: string;
};
