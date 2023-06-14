import { AgoraAPI } from "../lib/agoraAPI"
import { DelegateCardList } from "./components/DelegateCardList"

async function getDelegates() {
  const data = await AgoraAPI.get("/gov/op/delegates")
  return data
}

export default async function Page() {
  const delegates = await getDelegates()

  return (
    <section>
      <h1>Delegates</h1>
      <DelegateCardList delegateList={delegates} />
    </section>
  )
}
