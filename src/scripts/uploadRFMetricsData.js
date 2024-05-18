const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const metrics = [
  {
    metric_id: "gas_fees",
    name: "Gas Fees",
    description: `_Sum of a project's total contribution to gas fees across the Superchain._\n\n**Why this metric matters for the collective:** Gas fees are the primary recurring revenue source for the Superchain and a key indicator of aggregate blockspace demand. A project’s gas fee contribution is influenced by its total volume of contract interactions, the computational complexity of those interactions, and the state of the underlying gas market at the time of those transactions. In the long run, gas fees are what will power Retro Funding and enable it to continue in perpetuity. All members of the Superchain have committed at least 15% of their gross profit from gas fees to Retro Funding. Supporting projects that generate revenue in the form of gas fees helps power the economic engine of the Superchain.`,
  },
  {
    metric_id: "transaction_count",
    name: "Total Transactions",
    description: `_Count of a project’s transactions over the RF4 scope period October 2023 - June 2024._\n\n**Why this metric matters for the collective:** Optimism is a Layer 2 roll-up designed to improve the transaction throughput and reduce the fees on Ethereum. Layer 2s are crucial for scaling Ethereum because they help address the network's congestion issues without compromising its security or decentralization. Transaction counts are an important indicator for assessing the adoption and usage of all the new blockspace made available by the Superchain. Projects that have a sustained, high transaction count provide a clear signal of network growth and blockspace demand.`,
  },
  {
    metric_id: "trusted_transaction_count",
    name: "Interactions from Trusted Optimism Users",
    description: `_Count of a project’s transactions performed by trusted users, over the RF4 scope period October 2023 - June 2024, on a logarithmic scale._\n\n**Why this metric matters for the collective:** Bots, airdrop farming, and sybil attacks are longstanding problems in crypto. There are several teams in the Optimism ecosystem building reputation models for labeling “trusted users” in a privacy-preserving way. This metric aggregates reputation data from multiple platforms ([Farcaster](https://docs.farcaster.xyz/learn/architecture/hubs), [Passport](https://www.passport.xyz/), [EigenTrust by Karma3Labs](https://docs.karma3labs.com/eigentrust)) and only considers transactions that come from trusted users, a small subset of all active addresses on the Superchain. By tracking interactions specifically from trusted users, we gain a picture of blockspace demand that is less influenced by the effects of bots / farmers / sybils.`,
  },
  {
    metric_id: "trusted_transaction_share",
    name: "Trusted Optimism Users' Share of Total Interactions",
    description: `_Percentage of a project's total transactions that were made by trusted users over the RF4 scope period (October 2023 - June 2024). A project must have a minimum of 100 trusted users in order to be considered for this metric._\n\n**Why this metric matters for the collective:** This metric expresses _Interactions from Trusted Optimism Users_ and _Total Transactions_ as a simple ratio. Using a ratio makes it easier to compare trusted user levels across big projects and small projects side-by-side. For example, a project with 10K trusted transactions out of 20K total transactions would score better than a project with 10K trusted transactions out of 50K total transactions. This indicator is nuanced because it recognizes that minimizing bot / farming / sybil activity might go against economic incentives in the short term but is important for network quality in the long term. Given that this indicator is calculated on a percentage basis, projects with fewer than 100 users are not evaluated.`,
  },
  {
    metric_id: "trusted_users_onboarded",
    name: "Users Onboarded",
    description: `_Count of trusted users who interacted with a project within their first 7 days on the Superchain, on a logarithmic scale._\n\n**Why this metric matters for the collective:** Getting 1 billion users onchain won’t be easy. It will require better onramps and onchain UX than crypto natives are accustomed to. This metric identifies projects that helped onboard new users to the Superchain, going all the way back to each chain’s genesis block. In order to qualify, a new user has to also be in the set of trusted users. Then, any project on any chain that a user interacted with in their first week on the Superchain is counted. This is often multiple projects per new user. Supporting projects that are the first port of call for new users is essential for expanding the size and reach of the Superchain user’s base.`,
  },
  {
    metric_id: "trusted_monthly_active_users",
    name: "Average Trusted Monthly Active Users (MAUs)",
    description: `_Average of a project’s monthly active users (trusted users only) over the RF4 scope period (October 2023 - June 2024)._ \n\n**Why this metric matters for the collective:** We all know that attention is fleeting, especially in crypto. MAUs is one of the most important metrics for any project looking to grow a large user base. A project’s average MAUs also provides insights into its ongoing popularity and relevance within the Optimism ecosystem. The metric is calculated by counting the number of distinct trusted users for each month included in the RF4 scope period and then averaging the monthly totals. Newer projects receive 0s for the months before they launched. A consistent or growing base of trusted MAUs is a sign that there is a healthy, thriving community around a project.`,
  },
  {
    metric_id: "trusted_daily_active_users",
    name: "Average Trusted Daily Active Users (DAUs)",
    description: `_Average of a project’s daily active users (trusted users only) over the RF4 scope period (October 2023 - June 2024)._ \n\n**Why this metric matters for the collective:** Daily Active Users (DAUs) is a more granular view of a project's daily user activity and engagement levels than MAUs (Monthly Active Users). A high number of trusted DAUs would be a sign that Layer 2s have widespread adoption. The reality today is that there are very few apps that generate high levels of daily, revenue-generating activity from users. By averaging the number of active users on a daily basis over the RF4 period, this metric smooths out some of the blips and spikes in the data. New projects receive 0s for the days before they launched. Indeed, trusted DAUs is a hard metric to crack, but it truly hones in on projects that give their users a reason to come back frequently.`,
  },
  {
    metric_id: "trusted_recurring_users",
    name: "Trusted Recurring Users",
    description: `_Count of trusted users who have interacted with the project in at least 3 separate months over the RF4 scope period (October 2023 - June 2024) and at least 1 time between April - June 2024._ \n\n**Why this metric matters for the collective:** Many crypto natives are curious to try out new protocols. But churn and user retention are major issues. Recurring users represent the most loyal and committed segment of a project's user base. This metric considers users who have interacted with a project over the course of at least three distinct calendar months during the RF4 scope period – and at least once in recent months. Thus, it is intended to reflect sustained interest and ongoing engagement over time. A high count of recurring users signals strong project loyalty and a good user experience, and helps separate the fads from the future.`,
  },
];

async function main() {
  for (const metric of metrics) {
    await prisma.metrics_data.create({
      data: metric,
    });
  }
  console.log("Metrics data loaded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
