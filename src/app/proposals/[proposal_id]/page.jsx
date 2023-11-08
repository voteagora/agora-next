import styles from "./styles.module.scss";
// import AgoraAPI from "@/app/lib/agoraAPI";
// import AgoraSuspense from "@/components/shared/AgoraSuspense";
// import ReactMarkdown from "react-markdown";
import ProposalDescription from "@/components/Proposals/ProposalDescription";
import dynamic from "next/dynamic";

const ProposalVotes = dynamic(
  () => import("@/components/Proposals/ProposalVotes"),
  {
    ssr: false,
  }
);

export default async function Page({ params: { proposal_id } }) {
  return (
    <section className={styles.proposal_show}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="-mx-4 px-2 py-8 sm:mx-0 sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-4">
            <ProposalDescription proposal_id={proposal_id} />
          </div>
          {/* <div className="lg:col-start-3 lg:row-end-1 agora_votes">
            <h2>Votes</h2>
            <AgoraSuspense>
              <ProposalVotes proposal={proposal} />
            </AgoraSuspense>
          </div> */}
        </div>
      </div>
    </section>
  );
}
