export default function StakingFaq() {
  return (
    <div className="mt-10 font-inter">
      <h1 className="font-black text-2xl text-primary">FAQ</h1>
      <div className="mt-[18px]">
        <h2 className="font-semibold mt-4 ">What is Uniswap staking?</h2>
        <p className="mt-2">
          The Uniswap protocol can collect a small fee on trades through some of
          its liquidity pools. If collected, those fees are distributed in WETH
          to UNI token holders as a reward for delegating their votes and
          depositing UNI into the staking contract. A well-governed protocol is
          more likely to find success and increase the volume that flows through
          it, so UNI stakers are incentivized to delegate to the most effective
          governance participants.
        </p>

        <h2 className="font-semibold mt-8 text-primary">
          How do I find out more about delegates and the governance process in
          general?
        </h2>

        <p className="mt-2">
          The Uniswap Governance Process is described{" "}
          <a
            className="underline"
            href="https://gov.uniswap.org/t/community-governance-process-update-jan-2023/19976"
          >
            here
          </a>
          . In general, a “proposal” that involves the Uniswap Governance
          contracts executing some on-chain function can be put forward by
          anyone. The process is designed so that any credible proposal should
          generate discussion amongst delegates and move forward if there is
          some level of consensus. There are various off-chain stages to gauge
          that consensus that must be passed before an on-chain vote is
          ultimately posted.
        </p>

        <p className="mt-2">
          Stakers receive their pro-rata share of rewards earned while they
          stake. The rate of rewards varies on a number of factors, including
          how much volume is flowing through the protocol. There is no time
          constraint to staking. You could stake and delegate 1 UNI in one
          block, and unstake it ein the next. If there were 99 other UNI staked,
          you would earn 1% of the rewards distributed during that block. For a
          technical description of the staking mechanism, please visit the
          documentation.
        </p>

        <h2 className="font-semibold mt-8 text-primary">
          Which pools earn fees?
        </h2>
        <p className="mt-2">
          Currently, fees have not yet been turned on, so no rewards will accrue
          to stakers just yet. The roll-out of protocol fees will be incremental
          and data-driven. Gauntlet has suggested a framework to guide this
          process, which will occur over the course of several months and start
          with a limited number of pools. You can monitor which pools are
          currently charging fees as well as various analytics about the
          protocol fee here.
        </p>
      </div>
    </div>
  );
}
