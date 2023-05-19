import ProposalsList from "../../components/Proposals/ProposalsList";
import styles from "./styles.module.scss";

async function getProposals() {
  const res = await fetch("http://localhost:8000/api/v1/proposals", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
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
