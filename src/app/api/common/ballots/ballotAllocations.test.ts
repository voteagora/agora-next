// import { Ballot } from "./ballot";
import { Ballot } from "./ballot";
import { calculateAllocations } from "./ballotAllocations";
import { expect } from "@jest/globals";

const ballot = [
  {
    address: "0x123",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 3,
    metric_id: "monthly_active_addresses",
    allocation: 30,
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
    locked: false,
    allocations:
      '[{"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 10}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 30}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 60}]',
  },
];

describe("ballotAllocations", () => {
  it("should calcualte allocations", () => {
    const parsedBalot = ballot.map((b) => {
      return {
        ...b,
        status: b.status as Ballot["status"],
        allocations: JSON.parse(b.allocations) as Ballot["allocations"],
      };
    });

    const adjustedAllocations = calculateAllocations(parsedBalot, 0.4);

    console.log(adjustedAllocations);

    expect(adjustedAllocations).toEqual({
      address: "0x123",
      round_id: 4,
      status: "SUBMITTED",
      allocations: [
        {
          metric_id: "monthly_active_addresses",
          allocation: 3000000,
          locked: true,
        },
        {
          metric_id: "trusted_recurring_users",
          allocation: 5000000,
          locked: true,
        },
        {
          metric_id: "gas_fees",
          allocation: 2000000,
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
          allocation_per_metric: [
            {
              metric_id: "monthly_active_addresses",
              allocation: 1200000,
            },
            {
              metric_id: "trusted_recurring_users",
              allocation: 2000000,
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
          allocation_per_metric: [
            {
              metric_id: "monthly_active_addresses",
              allocation: 900000,
            },
            {
              metric_id: "trusted_recurring_users",
              allocation: 1500000,
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
          allocation_per_metric: [
            {
              metric_id: "monthly_active_addresses",
              allocation: 900000,
            },
            {
              metric_id: "trusted_recurring_users",
              allocation: 1500000,
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
