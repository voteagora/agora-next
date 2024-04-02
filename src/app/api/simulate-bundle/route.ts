type TransactionData = {
  networkId: string;
  from: string;
  target: string;
  calldata: string;
  value: number;
};

export async function POST(request: Request) {
  const body = await request.json();

  console.log("simulate-bundle", body.transactionsBundle);

  const user = process.env.TENDERLY_USER;
  const project = process.env.TENDERLY_PROJECT;

  const tenderlyData = body.transactionsBundle.map(
    (transaction: TransactionData) => {
      return {
        /* Simulation Configuration */
        save: true, // if true simulation is saved and shows up in the dashboard
        save_if_fails: true, // if true, reverting simulations show up in the dashboard
        simulation_type: "full", // full or quick (full is default)

        network_id: transaction.networkId || "1", // network to simulate on

        /* Standard EVM Transaction object */
        from: transaction.from || "", // governor address
        to: transaction.target || "",
        input: transaction.calldata || "0x",
        gas: 8000000,
        gas_price: 0,
        value: transaction.value || 0,
      };
    }
  );

  try {
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulate-bundle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": process.env.TENDERLY_ACCESS_KEY as string,
        },
        body: JSON.stringify({ simulations: tenderlyData }),
      }
    );
    const res = await response.json();

    return new Response(JSON.stringify({ response: res }), {
      status: 200,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: e?.response?.data?.error?.message || e?.message || e,
      }),
      {
        status: 500,
      }
    );
  }
}
