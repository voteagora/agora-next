export default function Loading() {
  return (
    <main className="max-w-screen-xl mx-auto mt-10">
      <div className="mb-4 flex flex-row items-center space-x-6">
        <h1 className="font-black text-primary text-2xl m-0">Loading...</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6">
        <section className="col-span-1 sm:col-span-2 order-last sm:order-first h-36 bg-agora-stone-100 animate-pulse rounded-lg"></section>
        <section className="col-span-1 h-12 bg-agora-stone-100 animate-pulse rounded-lg"></section>
      </div>
    </main>
  );
}
