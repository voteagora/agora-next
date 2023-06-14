import React from "react"

type Props = {
  support: number
}

const HumanVote = ({ support }: Props) => {
  let output
  let color
  switch (support) {
    case 1:
      output = "for"
      color = "green"
      break
    case 0:
      output = "against"
      color = "red"
      break
    case -1:
      output = "abstain"
      color = "black"
      break
    default:
      output = "Invalid input"
      color = "black"
  }
  return <span style={{ color }}>{output}</span>
}

export default HumanVote
