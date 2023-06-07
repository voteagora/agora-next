import styles from "./styles.module.scss";
import AgoraAPI from "../../lib/agora-api";

import {
  ArrowRightIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import { DelegateCardList } from "../../components/Delegates/DelegateCardList";

async function getDelegates() {
  await AgoraAPI.get("/delegates");
}

export default async function Page() {
  const delegates = await getDelegates();

  return (
    <section className={styles.proposals_container}>
      <h1>Delegates</h1>
      <DelegateCardList list={delegates} />
    </section>
  );
}