import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { HStack } from "@/components/Layout/Stack";
import CreateProposalForm from "@/components/Proposals/ProposalCreation/CreateProposalForm";
import InfoPanel from "@/components/Proposals/ProposalCreation/InfoPanel";
import Tenant from "@/lib/tenant/tenant";
import styles from "./styles.module.scss";


async function getProposalSettingsList() {
  "use server";
  return await fetchProposalTypes();
}

export default async function CreateProposalPage() {

  const { ui } = Tenant.current();

  if (!ui.toggle("proposals/create")) {
    return <div>Route not supported for namespace</div>;
  }


  const proposalSettingsList = await getProposalSettingsList();

  return (
    <HStack
      justifyContent="justify-between"
      gap={16}
      className={styles.create_prop_container}
    >
      <CreateProposalForm proposalSettingsList={proposalSettingsList} />
      <div className={styles.create_prop_right_box}>
        <InfoPanel />
      </div>
    </HStack>
  );
}
