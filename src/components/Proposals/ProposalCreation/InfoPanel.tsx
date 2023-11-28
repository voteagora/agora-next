import { VStack } from "@/components/Layout/Stack";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import styles from "./styles.module.scss";

export default function InfoPanel() {
  return (
    <VStack className={styles.info_panel}>
      <h2 className={styles.info_panel__title}>Manager’s handbook</h2>
      <div className={styles.info_panel__description}>
        <p>
          <span className="font-semibold">
            1. Ensure your type is correctly defined
          </span>
          <br />
          All Mission Applications are processed by either an elected Grants
          Council or the Foundation. Mission Applications should follow the
          process outlined on each individual Mission Request.
        </p>
        <p>
          <span className="font-semibold">2. Create proposals</span>
          <br />
          All Mission Applications are processed by either an elected Grants
          Council or the Foundation. Mission Applications should follow the
          process outlined on each individual Mission Request.
        </p>
        <p>
          <span className="font-semibold">3. Get signatures for your SAFE</span>
          <br />
          All Mission Applications are processed by either an elected Grants
          Council or the Foundation. Mission Applications should follow the
          process outlined on each individual Mission Request.
        </p>
      </div>
    </VStack>
  );
}
