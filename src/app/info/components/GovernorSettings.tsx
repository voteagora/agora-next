import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GovernorSettingsParams from "@/app/info/components/GovernorSettingsParams";
import ContractList from "@/app/info/components/ContractList";
import GovernorSettingsProposalTypes from "@/app/info/components/GovernorSettingsProposalTypes";

const GovernorSettings = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border p-6 mt-4 rounded-lg bg-neutral"
    >
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger className="text-base font-bold text-black hover:no-underline p-0">
          Governor settings
        </AccordionTrigger>
        <AccordionContent className="mt-6 border-t pt-6">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-[65%] border border-gray-300 rounded-lg">
              <ContractList />
            </div>
            <div className="w-full sm:w-[35%] border border-gray-300 h-fit rounded-lg">
              <GovernorSettingsParams />
            </div>
          </div>
          <div className="w-full border border-gray-300 rounded-lg mt-6">
            <GovernorSettingsProposalTypes />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GovernorSettings;
