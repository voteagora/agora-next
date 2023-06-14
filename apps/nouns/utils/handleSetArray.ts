import { Dispatch, SetStateAction } from "react"

export function handleSetArray(
  index: number,
  value: any,
  currentState: any[],
  setState: Dispatch<SetStateAction<any[]>>
) {
  let items = [...currentState]
  items[index] = value
  setState(items)
}
