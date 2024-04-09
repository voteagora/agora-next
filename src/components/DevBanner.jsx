import styles from "./styles.module.scss";
export default function DevBanner() {
  return (
    <div className={styles.dev_banner}>
      <p>{process.env.AGORA_ENV}</p>
    </div>
  );
}
