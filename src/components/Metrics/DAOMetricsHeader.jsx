import { HStack } from "../Layout/Stack";
import MetricContainer from "./MetricContainer";
import { TOKEN, formatNumber } from "@/lib/tokenUtils";
import { useMemo } from "react";
import styles from "./daometrics.module.scss";

const defaultMetrics = {
  votableSupply: 0,
  totalSupply: 0,
  quorum: 0,
};

export default function DAOMetricsHeader({ metrics }) {
  const formattedMetrics = useMemo(() => {
    if (!metrics) return defaultMetrics;
    return {
      votableSupply: formatNumber(metrics.votableSupply),
      totalSupply: formatNumber(metrics.totalSupply),
      quorum: formatNumber(metrics.quorum),
    };
  }, [metrics]);

  return (
    <div className={styles.metrics_container}>
      <MetricContainer
        icon="community"
        title="Delegated / Total supply"
        body={
          <>
            {formattedMetrics.votableSupply} {TOKEN.symbol} /{" "}
            {formattedMetrics.totalSupply} {TOKEN.symbol}
          </>
        }
      />
      <MetricContainer
        icon="ballot"
        title="Quorum"
        body={
          <>
            {formattedMetrics.quorum} {TOKEN.symbol}
          </>
        }
      />
      <MetricContainer
        icon="pedestrian"
        title="Learn more"
        body={<>Operating Manual</>}
        link={
          "https://github.com/ethereum-optimism/OPerating-manual/blob/main/manual.md"
        }
      />
      <MetricContainer
        icon="pedestrian"
        title="Learn more"
        body={<>Governance Calendar</>}
        link={
          "https://calendar.google.com/calendar/u/0/r?cid=Y19mbm10Z3VoNm5vbzZxZ2JuaTJncGVyaWQ0a0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
        }
      />
      <MetricContainer
        icon="pedestrian"
        title="Learn more"
        body={<>Delegation FAQ</>}
        link={
          "https://calendar.google.com/calendar/u/0/r?cid=Y19mbm10Z3VoNm5vbzZxZ2JuaTJncGVyaWQ0a0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
        }
      />
    </div>
  );
}
