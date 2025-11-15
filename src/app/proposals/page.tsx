// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import ProposalsHome from "@/components/Proposals/ProposalsHome";

export const revalidate = 'force-dynamic';

export { generateMetadata } from "../page";
export default ProposalsHome;
