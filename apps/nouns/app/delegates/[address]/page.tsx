import { AgoraAPI } from "../../lib/agoraAPI"

type Props = {
  address: string
}

async function getDelegate(address: string) {
  const data = await AgoraAPI.get(`/gov/op/delegates/${address}`)
  return data
}

export default async function Page({
  params
}: {
  params: { address: string }
}) {
  const delegate = await getDelegate(params.address)

  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
            <h1>{delegate.address}</h1>
          </div>
        </div>
      </div>
    </section>
  )
}
