// import { Ballot } from "./ballot";
import { Ballot } from "./ballot";
import { calculateAllocations } from "./ballotAllocations";
import { expect, describe, it } from "vitest";

const ballot = [
  {
    address: "0x123",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 3,
    metric_id: "monthly_active_addresses",
    allocation: 30,
    updated_at: new Date("2021-10-01"),
    created_at: new Date("2021-10-01"),
    locked: true,
    allocations:
      '[{"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 10}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 30}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 60}]',
  },
  {
    address: "0x123",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 3,
    metric_id: "trusted_recurring_users",
    allocation: 50,
    updated_at: new Date("2021-10-01"),
    created_at: new Date("2021-10-01"),
    locked: true,
    allocations:
      '[{"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 10}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 30}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 60}]',
  },
  {
    address: "0x123",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 3,
    metric_id: "gas_fees",
    allocation: 20,
    updated_at: new Date("2021-10-01"),
    created_at: new Date("2021-10-01"),
    locked: false,
    allocations:
      '[{"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 10}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 30}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 60}]',
  },
];

describe("ballotAllocations", () => {
  it("should calculate allocations", () => {
    const parsedBallot = ballot.map((b) => {
      return {
        ...b,
        status: b.status as Ballot["status"],
        allocations: JSON.parse(b.allocations) as Ballot["allocations"],
        published_at: new Date("2021-10-01"),
      };
    });

    const adjustedAllocations = calculateAllocations(parsedBallot, 0.4);

    expect(adjustedAllocations).toEqual({
      address: "0x123",
      round_id: 4,
      status: "SUBMITTED",
      updated_at: new Date("2021-10-01"),
      created_at: new Date("2021-10-01"),
      published_at: new Date("2021-10-01"),
      os_only: false,
      os_multiplier: 3,
      allocations: [
        {
          metric_id: "monthly_active_addresses",
          allocation: 30,
          locked: true,
        },
        {
          metric_id: "trusted_recurring_users",
          allocation: 50,
          locked: true,
        },
        {
          metric_id: "gas_fees",
          allocation: 20,
          locked: false,
        },
      ],
      project_allocations: [
        {
          project_id: "synapse",
          name: "Imaginary Pulse",
          image: "",
          is_os: false,
          allocation: 4000000,
          allocations_per_metric: [
            {
              metric_id: "trusted_recurring_users",
              allocation: 2000000,
            },
            {
              metric_id: "monthly_active_addresses",
              allocation: 1200000,
            },
            {
              metric_id: "gas_fees",
              allocation: 800000,
            },
          ],
        },
        {
          project_id: "d-hedge",
          name: "Foo Link",
          image: "",
          is_os: true,
          allocation: 3000000,
          allocations_per_metric: [
            {
              metric_id: "trusted_recurring_users",
              allocation: 1500000,
            },
            {
              metric_id: "monthly_active_addresses",
              allocation: 900000,
            },
            {
              metric_id: "gas_fees",
              allocation: 600000,
            },
          ],
        },
        {
          project_id: "hypercerts",
          name: "Bar Forge",
          image: "",
          is_os: false,
          allocation: 3000000,
          allocations_per_metric: [
            {
              metric_id: "trusted_recurring_users",
              allocation: 1500000,
            },
            {
              metric_id: "monthly_active_addresses",
              allocation: 900000,
            },
            {
              metric_id: "gas_fees",
              allocation: 600000,
            },
          ],
        },
      ],
    });
  });
});
