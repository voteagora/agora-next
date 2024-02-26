import {
  OptimismAdvancedVotingPower,
  OptimismVotingPower,
} from "@prisma/client";

export type AdvancedVotingPowerPayload = OptimismAdvancedVotingPower;
export type VotingPowerPayload = OptimismVotingPower;

export type VotingPowerData = {
  directVP: string;
  advancedVP: string;
  totalVP: string;
};
