import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GovernorSettingsParams from "@/app/info/components/GovernorSettingsParams";
import ContractList from "@/app/info/components/ContractList";
import GovernorSettingsProposalTypes from "@/app/info/components/GovernorSettingsProposalTypes";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const GovernorSettings = async () => {
  const proposalTypes = await fetchProposalTypes();
  const { namespace } = Tenant.current();

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border border-line p-6 mt-4 rounded-xl bg-neutral shadow-sm"
    >
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger className="text-primary font-bold hover:no-underline p-0">
          Governor settings
        </AccordionTrigger>
        <AccordionContent className="pt-6 px-0">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <div
              className={`w-full border border-line rounded-lg ${
                namespace !== TENANT_NAMESPACES.UNISWAP ? "sm:w-[65%]" : ""
              }`}
            >
              <ContractList />
            </div>
            {namespace !== TENANT_NAMESPACES.UNISWAP && (
              <div className="w-full sm:w-[35%] border border-line h-fit rounded-lg">
                <GovernorSettingsParams />
              </div>
            )}
          </div>
          <div className="w-full border border-line rounded-lg mt-6">
            <GovernorSettingsProposalTypes proposalTypes={proposalTypes} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GovernorSettings;
