import { HStack } from "@/components/Layout/Stack";
import InfoPanel from "@/components/Proposals/ProposalCreation/InfoPanel";
import styles from "./styles.module.scss";
import CreateProposalForm from "@/components/Proposals/ProposalCreation/CreateProposalForm";

export default function CreateProposalPage() {
  return (
    <HStack
      justifyContent="justify-between"
      gap={16}
      className={styles.create_prop_container}
    >
      <CreateProposalForm />
      <div className={styles.create_prop_right_box}>
        <InfoPanel />
      </div>
    </HStack>
  );
}
