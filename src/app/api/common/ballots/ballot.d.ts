import { Ballots, allocations } from "@prisma/client";

export type Ballot = {
  address: Ballots["address"];
  round: Ballots["round"];
  os_only: Ballots["os_only"];
  os_multiplier: Ballots["os_multiplier"];
  allocations: Allocation[];
  allocation: number;
  status: "SUBMITTED" | "PENDING";
  locked: boolean;
  metric_id: string;
};

type Allocation = {
  project_id: string;
  name: string;
  image: string;
  is_os: boolean;
  value: number;
};

export type BallotResponse = {
  address: string;
  round_id: number;
  status: "SUBMITTED" | "PENDING";
  allocations: {
    metric_id: string;
    allocation: number;
    locked: boolean;
  }[];
  project_allocations: {
    project_id: string;
    name: string;
    image: string;
    is_os: boolean;
    allocation: number;
    allocation_per_metric: {
      metric_id: string;
      allocation: number;
    }[];
  }[];
};
