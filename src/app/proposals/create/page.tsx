import { HStack } from "@/components/Layout/Stack";
import InfoPanel from "@/components/Proposals/ProposalCreation/InfoPanel";
import styles from "./styles.module.scss";

export default function CreateProposalPage() {
  return (
    <HStack
      justifyContent="justify-between"
      gap={16}
      className={styles.create_prop_container}
    >
      {/* <CreateProposalForm /> */}
      <p>form</p>
      <div className={styles.create_prop_container_right}>
        <InfoPanel />
      </div>
    </HStack>
  );
}
