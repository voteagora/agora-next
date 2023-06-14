import React from "react"

type Props = {
  address: string
}

const HumanAddress = ({ address }: Props) => {
  const humanAddress = `${address.slice(0, 4)}...${address.slice(-4)}`
  return <span>{humanAddress}</span>
}

export default HumanAddress
