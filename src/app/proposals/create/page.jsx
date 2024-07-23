import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import { HStack } from "@/components/Layout/Stack";
import CreateProposalForm from "@/components/Proposals/ProposalCreation/CreateProposalForm";
import InfoPanel from "@/components/Proposals/ProposalCreation/InfoPanel";
import Tenant from "@/lib/tenant/tenant";

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
      className="w-full max-w-[76rem] mt-12 mb-8 flex flex-col-reverse items-center sm:flex-row sm:items-start"
    >
      <CreateProposalForm proposalSettingsList={proposalSettingsList} />
      <div className=" shrink-0 w-full sm:w-[24rem]">
        <InfoPanel />
      </div>
    </HStack>
  );
}
