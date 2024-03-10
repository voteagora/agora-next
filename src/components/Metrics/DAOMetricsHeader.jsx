"use server";

import MetricContainer from "./MetricContainer";
import { formatNumber } from "@/lib/tokenUtils";
import styles from "./daometrics.module.scss";
import Tenant from "@/lib/tenant/tenant";

export default async function DAOMetricsHeader({ metrics }) {

  const {token}  = Tenant.getInstance();

  const formattedMetrics = {
    votableSupply: formatNumber(metrics.votableSupply),
    totalSupply: formatNumber(metrics.totalSupply),
    quorum: formatNumber(metrics.quorum),
  };

  return (
    <div className={styles.metrics_container}>
      <MetricContainer
        icon="users"
        title="Delegated / Total supply"
        body={
          <>
            {formattedMetrics.votableSupply} {token.symbol} /{" "}
            {formattedMetrics.totalSupply} {token.symbol}
          </>
        }
      />
      <MetricContainer
        icon="flag"
        title="Quorum"
        body={
          <>
            {formattedMetrics.quorum} {token.symbol}
          </>
        }
      />
      <MetricContainer
        icon="file"
        title="Learn more"
        body={<>Operating Manual</>}
        link={
          "https://github.com/ethereum-optimism/OPerating-manual/blob/main/manual.md"
        }
      />
      <MetricContainer
        icon="calendar"
        title="Learn more"
        body={<>Governance Calendar</>}
        link={
          "https://calendar.google.com/calendar/u/0/r?cid=Y19mbm10Z3VoNm5vbzZxZ2JuaTJncGVyaWQ0a0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
        }
      />
      <MetricContainer
        icon="lightbulb"
        title="Learn more"
        body={<>Delegation FAQ</>}
        link={
          "https://argoagora.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c"
        }
      />
    </div>
  );
}
