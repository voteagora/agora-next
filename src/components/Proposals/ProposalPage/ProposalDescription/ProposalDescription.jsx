"use client";

import { VStack } from "@/components/Layout/Stack";
import { getTitleFromProposalDescription } from "@/lib/proposalUtils";
import ReactMarkdown from "react-markdown";
import ProposalTitle from "../ProposalTitle/ProposalTitle";
import styles from "./proposalDescription.module.scss";
import { cn } from "@/lib/utils";
import ApprovedTransactions from "../ApprovedTransactions/ApprovedTransactions";

export default function ProposalDescription({ proposal }) {
  const proposalsWithBadDescription = [
    "94365805422398770067924881378455503928423439630602149628781926844759467250082",
    "64930538748268257621925093712454552173772860987977453334165023026835711650357",
    "51738314696473345172141808043782330430064117614433447104828853768775712054864",
    "32970701904870446614408373011942917680422376755229075190214017021915019093516",
    "103695324913424597802389181312722993037601032681914451632412140667432224173014",
  ];

  // This is a hack to hide a proposal formatting mistake from the OP Foundation
  const proposalsWithBadFormatting = [
    "114732572201709734114347859370226754519763657304898989580338326275038680037913",
    "27878184270712708211495755831534918916136653803154031118511283847257927730426",
    "90839767999322802375479087567202389126141447078032129455920633707568400402209",
  ];
  const patchedDescription = proposalsWithBadDescription.includes(proposal.id)
    ? proposal.description.split("\\n ")[1]
    : proposal.description;

  const title = proposal.markdowntitle;

  const shortTitle = proposalsWithBadFormatting.includes(proposal.id)
    ? title.split("-")[0].split("(")[0]
    : title;

  function stripTitleFromDescription(title, description) {
    // TODO: This is very fragile. Consider using a regex instead?
    if (description.startsWith(`# ${title}`)) {
      const newDescription = description.slice(`# ${title}`.length).trim();
      return newDescription;
    }
    return description;
  }

  return (
    <VStack gap={4} className={styles.proposal_description}>
      <ProposalTitle title={shortTitle} proposerAddress={proposal.proposer} />
      <VStack gap={2}>
        <ApprovedTransactions proposalData={proposal.proposalData}/>
        <ReactMarkdown
          className={cn(styles.proposal_description_md, "max-w-none", "prose")}
        >
          {stripTitleFromDescription(shortTitle, patchedDescription)}
        </ReactMarkdown>
      </VStack>
    </VStack>
  );
}
