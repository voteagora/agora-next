"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

type Props = {
  delegateList: any[]
}

export const DelegateCardList = ({ delegateList }: Props) => {
  const router = useRouter()

  const viewDelegate = (delegateAddress: string) => {
    router.push(`/delegates/${delegateAddress}`)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {delegateList.map((delegate) => (
        <div
          key={delegate.id}
          className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
          onClick={() => viewDelegate(delegate.address)}
        >
          <div className="flex-shrink-0">
            <Image
              src="/images/placeholder_avatar.png"
              width={100}
              height={100}
              alt={`${delegate.address} avatar`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <a href="#" className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">
                {delegate.total_voting_power}
              </p>
              <p className="text-sm text-gray-500">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Reiciendis ipsa dolor obcaecati, nisi beatae asperiores autem
                incidunt animi amet perspiciatis inventore enim fuga alias aut
                doloremque quibusdam exercitationem explicabo praesentium!
              </p>
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
