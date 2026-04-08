import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = request.url;

  console.log("[Mock DAO Node] Intercepted GET /" + path);

  if (path.includes("upstash")) {
    return NextResponse.json({ result: null });
  }

  if (path.includes("v1/delegate/")) {
    const address = path.split("/").pop();
    const delegateData: any = {
      addr: address,
      address: address,
      voting_power: "1000000000000000000000000",
      delegators_count: 50,
      from_cnt: 50,
      from_list: [],
      participation: [10, 10], // Active delegate (100% participation > 0.5 and > 10 proposals)
    };

    if (address?.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
      delegateData.statement = {
        payload: {
          delegateStatement: "This is my mock statement for hardhat 0",
        },
      };
    }

    return NextResponse.json({ delegate: delegateData });
  }

  if (path === "v1/delegates") {
    return NextResponse.json({
      count: 2,
      delegates: [
        {
          addr: "delegate-1.eth",
          VP: "1000000000000000000000000",
          DC: 50,
        },
        {
          addr: "delegate-2.eth",
          VP: "0",
          DC: 0,
        },
      ],
    });
  }

  if (path === "v1/proposals/test-active") {
    return NextResponse.json({
      id: "test-active",
      proposer: "0x1111111111111111111111111111111111111111",
      description:
        "# Mock Active Proposal for Voting\nThis is a mock active proposal.",
      block_number: 1000000,
      start_block: 2000000,
      end_block: 90000000,
      voting_module_name: "standard",
      proposal_type: "STANDARD",
      proposal_data: "0x",
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: { "no-param": { "0": "0", "1": "0", "2": "0" } },
      values: ["0"],
      targets: ["0x0000000000000000000000000000000000000000"],
      signatures: [""],
      calldatas: ["00"],
    });
  }

  if (path === "v1/proposals/test-defeated") {
    return NextResponse.json({
      id: "test-defeated",
      proposer: "0x2222222222222222222222222222222222222222",
      description:
        "# Mock Defeated Proposal\nThis is a mock defeated proposal.",
      block_number: 1000000,
      start_block: 2000000,
      end_block: 3000000,
      voting_module_name: "standard",
      proposal_type: "STANDARD",
      proposal_data: "0x",
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: {
        "no-param": {
          "0": "1000000000000000000000000",
          "1": "500000000000000000000",
          "2": "0",
        },
      },
      values: ["0"],
      targets: ["0x0000000000000000000000000000000000000000"],
      signatures: [""],
      calldatas: ["00"],
    });
  }

  if (path === "v1/proposal_types") {
    return NextResponse.json({
      proposal_types: {
        STANDARD: { name: "Standard" },
        APPROVAL: { name: "Approval" },
        OPTIMISTIC: { name: "Optimistic" },
      },
    });
  }

  if (path === "v1/voting_power") {
    return NextResponse.json({
      voting_power: "1000000000000000000000000",
    });
  }

  if (path === "v1/proposals") {
    return NextResponse.json({
      proposals: [
        {
          id: "1",
          proposer: "0x1231231231231231231231231231231231231231",
          description: "# Mock Active Proposal\nActive prop",
          block_number: 1000000,
          start_block: 2000000,
          end_block: 90000000,
          voting_module_name: "standard",
          proposal_type: "STANDARD",
          proposal_data: "0x",
          cancel_event: null,
          execute_event: null,
          queue_event: null,
          totals: {
            "no-param": {
              "0": "1000000000000000000000",
              "1": "5000000000000000000000",
              "2": "0",
            },
          },
          values: ["0"],
          targets: ["0x0000000000000000000000000000000000000000"],
          signatures: [""],
          calldatas: ["00"],
        },
        {
          id: "2",
          proposer: "0x4564564564564564564564564564564564564564",
          description: "# Mock Defeated Proposal\nDef prop",
          block_number: 1000000,
          start_block: 2000000,
          end_block: 3000000,
          voting_module_name: "standard",
          proposal_type: "STANDARD",
          proposal_data: "0x",
          cancel_event: null,
          execute_event: null,
          queue_event: null,
          totals: {
            "no-param": {
              "0": "1000000000000000000000000",
              "1": "0",
              "2": "0",
            },
          },
          values: ["0"],
          targets: ["0x0000000000000000000000000000000000000000"],
          signatures: [""],
          calldatas: ["00"],
        },
        {
          id: "3",
          proposer: "0x7897897897897897897897897897897897897897",
          description: "# Mock Pending/Draft Proposal\nPending prop",
          block_number: 99000000,
          start_block: 99000000,
          end_block: 99990000,
          voting_module_name: "standard",
          proposal_type: "STANDARD",
          proposal_data: "0x",
          cancel_event: null,
          execute_event: null,
          queue_event: null,
          totals: { "no-param": { "0": "0", "1": "0", "2": "0" } },
          values: ["0"],
          targets: ["0x0000000000000000000000000000000000000000"],
          signatures: [""],
          calldatas: ["00"],
        },
      ],
    });
  }

  console.log("[Mock DAO Node] Catch-all returning 404 for:", path);
  return NextResponse.json({ error: "Not mocked" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  console.log("[Mock DAO Node] Intercepted POST /" + path);

  if (path.includes("upstash")) {
    return NextResponse.json({ result: null });
  }

  return NextResponse.json({ success: true, transactionHash: "0xabc123" });
}
