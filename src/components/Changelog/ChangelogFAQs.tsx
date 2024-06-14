export default function ChangelogFAQs() {
  return (
    <aside className="sm:w-[320px]">
      <div className="gl_box gl_box_secondary sm:sticky sm:top-[20px]">
        <h1 className="font-extrabold text-xl mt-3">FAQ</h1>
        <div className="prose prose-sm space-y-6">
          <div>
            <h2 className="font-semibold text-sm">
              What is the AgoraChangelog contract?
            </h2>
            <p>
              The AgoraChangelog contract is a decentralized solution to manage
              and track updates or changes in a project. It ensures that only
              authorized entries are posted, maintaining the integrity of the
              changelog.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              What attributes can be included in a changelog entry?
            </h2>
            <p>
              Each entry in the changelog can include attributes such as the
              description of the change, the timestamp, the author, and any
              relevant metadata. These attributes help provide context and
              details about each update.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              How do I post an entry to the changelog?
            </h2>
            <p>
              To post an entry, you need to be an authorized user. Once
              authorized, you can submit a transaction to the contract with the
              required attributes for the new entry. The contract then records
              this entry on the blockchain.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              Can the deployer post entries?
            </h2>
            <p>
              Yes, the deployer can post entries and also manage authorized
              users. This ensures the changelog is maintained and updated
              accurately from the start.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              How is the changelog initialized?
            </h2>
            <p>
              The deployer initializes the changelog contract, setting the
              initial parameters and the first manager if necessary. This
              process establishes control and ensures proper setup.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              Why use a blockchain-based changelog?
            </h2>
            <p>
              Using a blockchain-based changelog ensures transparency,
              immutability, and decentralization. Each entry is recorded on the
              blockchain, providing a verifiable history of changes that cannot
              be tampered with.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
