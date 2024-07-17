import { Ballots, allocations } from "@prisma/client";

export type Ballot = {
  address: Ballots["address"];
  round: Ballots["round"];
  os_only: Ballots["os_only"];
  os_multiplier: Ballots["os_multiplier"];
  updated_at: Ballots["updated_at"];
  created_at: Ballots["created_at"];
  published_at: Date;
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
  os_only: boolean;
  os_multiplier: number;
  updated_at: Date;
  created_at: Date;
  published_at: Date;
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
    allocations_per_metric: {
      metric_id: string;
      allocation: number;
    }[];
  }[];
};
