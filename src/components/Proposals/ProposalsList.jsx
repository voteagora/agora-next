import Link from "next/link";
import styles from "./styles.module.scss";
import link from "next/link";
export const ProposalsList = ({ list }) => (
  <div className={styles.proposals}>
    <table>
      <thead>
        <tr>
          <th>UUID</th>
          <th>Proposer Address</th>
          <th>Token</th>
          <th>Kind</th>
        </tr>
      </thead>
      <tbody>
        {list.map((item) => (
          <tr key={item.id}>
            <td>
              <Link href={`/proposals/${item.uuid}`}>{item.uuid}</Link>
            </td>
            <td>{item.proposer_addr}</td>
            <td>{item.token}</td>
            <td>{item.kind}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProposalsList;
