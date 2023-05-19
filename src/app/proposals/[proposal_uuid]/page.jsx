import styles from "./styles.module.scss";

async function getProposal(proposal_uuid) {
  const res = await fetch(
    `http://localhost:8000/api/v1/proposals/${proposal_uuid}`
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export default async function Page({ params: { proposal_uuid } }) {
  const proposal = await getProposal(proposal_uuid);

  return (
    <section className={styles.proposal_show}>
        <h3>A {proposal.token} proposal</h3>
      <h1>{proposal.uuid}</h1>
      <div>{proposal.description}</div>
    </section>
  );
}
