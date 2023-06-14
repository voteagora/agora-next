import styles from "./styles.module.scss";
import AgoraAPI from "../lib/agoraAPI";

import { DelegateCardList } from "../../components/Delegates/DelegateCardList";

async function getDelegates() {
  const api = new AgoraAPI();
  const data = await api.get("/delegates");
  return data;
}

export default async function Page() {
  const delegates = await getDelegates();

  return (
    <section>
      <h1>Delegates</h1>
      <DelegateCardList delegateList={delegates} />
    </section>
  );
}