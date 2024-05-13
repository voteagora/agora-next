import { Ballots, allocations } from "@prisma/client";

export type Ballot = {
  address: Ballots["address"];
  round: Ballots["round"];
  os_only: Ballots["os_only"];
  os_multiplier: Ballots["os_multiplier"];
  created_at: Ballots["created_at"];
  updated_at: Ballots["updated_at"];
  allocations: Allocation[];
  status: "SUBMITTED" | "PENDING";
};

type Allocation = {
  address: allocations["address"];
  round: allocations["round"];
  metric_id: allocations["metric_id"];
  allocation: allocations["allocation"];
  locked: allocations["locked"];
  created_at: allocations["created_at"];
  updated_at: allocations["updated_at"];
};
