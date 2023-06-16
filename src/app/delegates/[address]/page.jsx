/* 
* Show page for a single delegate
* Takes in the delegate address as a parameter
*/

import AgoraAPI from "@/app/lib/agoraAPI";

async function getDelegate(address) {
  const api = new AgoraAPI();
  const data = await api.get(`/delegates/${address}`);
  return data;
}

export default async function Page({ params: { address } }) {
  const delegate = await getDelegate(address);

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
  );
}
