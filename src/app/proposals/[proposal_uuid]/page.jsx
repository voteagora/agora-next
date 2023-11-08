/* eslint-disable react/jsx-key */
"use client";

import styles from "./styles.module.scss";
import { ProposalVotes } from "@/components/Proposals/ProposalVotes";
import AgoraAPI from "@/app/lib/agoraAPI";
import AgoraSuspense from "@/components/shared/AgoraSuspense";
import ReactMarkdown from "react-markdown";

async function getProposal(proposal_uuid) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal_uuid}`);
  return data.proposal;
}

function formatMarkdown(markdownText) {
  return markdownText.replace(/\\n/g, "\n");
}

export default async function Page({ params: { proposal_uuid } }) {
  const proposal = await getProposal(proposal_uuid);

  const formattedDescription = formatMarkdown(proposal.description);

  return (
    <section className={styles.proposal_show}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="-mx-4 px-2 py-8 sm:mx-0 sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-4">
            <div className="agora_markdown">
              {formattedDescription.split("\n").map((line, index) => {
                if (index === 0) {
                  // First line is the title
                  return <ReactMarkdown>{line}</ReactMarkdown>;
                } else {
                  // Rest of the lines are markdown content
                  return <ReactMarkdown>{line}</ReactMarkdown>;
                }
              })}
            </div>
          </div>
          <div className="lg:col-start-3 lg:row-end-1 agora_votes">
            <h2>Votes</h2>
            <AgoraSuspense>
              <ProposalVotes proposal={proposal} />
            </AgoraSuspense>
          </div>
        </div>
      </div>
    </section>
  );
}
