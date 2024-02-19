export default function FAQs() {
  return (
    <aside className="sm:w-[320px]">
      <div className="gl_box gl_box_secondary sm:sticky sm:top-[20px]">
        <h1 className="font-extrabold text-xl mt-3">FAQ</h1>
        <div className="prose prose-sm space-y-6">
          <div>
            <h2 className="font-semibold text-sm">
              What’s the difference between voting period and voting delay?
            </h2>
            <p>
              A voting period determines how many hours voters get to vote on
              proposals. Voting delay means how many hours voters have to wait
              after a proposal is created before they&apos;re allowed to vote. A
              delay can be helpful if you want to create proposals in advance,
              but not have them votable just yet. Note that both values apply to
              future proposals. To edit the voting period of an active proposal,
              please reach out to the Agora team.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">What are proposal types?</h2>
            <p>
              A proposal type is a set of parameters that proposals can be
              configured with. These are helpful when different types of
              proposals have different quorum and approval threshold values.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              What’s the difference between quorum and approval threshold?
            </h2>
            <p>
              The quorum is the minimum number of For or Abstain votes needed
              for a proposal to pass. The quorum is calculated as a percentage
              of the total votable supply. The approval threshold refers to the
              percentage of votes for each proposal that must be For in order
              for a proposal to pass. A proposal needs to pass both quorum and
              approval threshold to succeed.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
