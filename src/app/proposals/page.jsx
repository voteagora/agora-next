import ProposalsList from "../../components/Proposals/ProposalsList";
import styles from "./styles.module.scss";
import AgoraAPI from "../lib/agoraAPI";

async function getProposals() {

    const api = new AgoraAPI();
    const data = await api.get("/proposals");
    return data;
}

export default async function Page() {
  const proposals = await getProposals();

  return (
    <section className={styles.proposals_container}>
      <h1>Proposals</h1>
      <ProposalsList list={proposals} />
    </section>
  );
}
