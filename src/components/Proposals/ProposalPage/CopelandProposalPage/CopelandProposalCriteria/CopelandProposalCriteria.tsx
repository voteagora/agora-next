import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronsUpDown } from "lucide-react";

export default function CopelandProposalCriteria() {
  return (
    <div className="flex flex-col p-4 pb-2 border-t border-line">
      <Accordion type="single" collapsible>
        <AccordionItem
          className="first-of-type:rounded-t-sm last-of-type:rounded-b-sm rounded-sm border border-line bg-wash text-sm"
          value="item-1"
        >
          <AccordionTrigger
            icon={ChevronsUpDown}
            className="text-primary font-semibold hover:no-underline py-0 pr-0"
          >
            Details
          </AccordionTrigger>
          <AccordionContent className="text-xs font-secondary font-semibold py-2 px-4">
            Ranked choice voting (using the Copeland method) compares every
            candidate in head-to-head matchups. For each pair, a candidate earns
            a point for a win. Candidates are stack ranked based on number of
            wins. Ties are broken using average voting support across every
            matchup.
            <br />
            <br />
            Read the snapshot proposal description for details about how and
            where to vote.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
