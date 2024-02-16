import { VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";

export default function InfoPanel() {
  return (
    <VStack className={styles.info_panel}>
      <h2 className={styles.info_panel__title}>Manager’s handbook</h2>
      <div className={styles.info_panel__description}>
        <p>
          <span className="font-semibold">1. Select proposal type</span>
          <br />
          Proposal types set the quorum and approval thresholds for your
          proposal. You can view, edit, or create a new one via the{" "}
          <a href="/admin">admin panel</a>.
        </p>
        <p>
          <span className="font-semibold">2. Choose your vote type</span>
          <br />
          This determines if your proposal will be a simple yes/no or a multiple
          choice.
        </p>
        <p>
          <span className="font-semibold">3. Create your proposal</span>
          <br />
          Now that the vote and proposal type are set, you can use this form to
          create your proposal. Proposed transactions are optional, as the Token
          House governor is not executable for now.
        </p>
        <p>
          <span className="font-semibold">4. Get signatures for your SAFE</span>
          <br />
          If you&apos;re using the OP Foundation multisig, you can queue several
          proposals at once so that your co-signers can sign all the
          transactions in one sitting. Proposals will appear in chronological
          order in the final UI, so the last proposal you put in will show up on
          top for voters. Note that the order is not guaranteed if you batch all
          the proposal creation transactions into a single block, as then there
          is no timing difference.
        </p>
      </div>
    </VStack>
  );
}
