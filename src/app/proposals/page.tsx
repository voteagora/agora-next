// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import ProposalsHome from "@/components/Proposals/ProposalsHome";

export const revalidate = 60;

export { generateMetadata } from "../page";
export default function ProposalsIndex() {
  return (
    <>
      <ProposalsHome />
      <button className="fixed bottom-10 right-10 z-[9999] bg-orange-600 px-8 py-4 rounded-full text-white font-bold animate-bounce shadow-2xl">
        [QA] PROPOSALS DRIFT TARGET
      </button>
    </>
  );
}
