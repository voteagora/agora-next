import { Dispatch, SetStateAction } from "react"

export function handleSetObject(
  key: string,
  value: any,
  object: Record<string, any>,
  setObject: Dispatch<SetStateAction<object>>,
  setSuccess?: Dispatch<SetStateAction<boolean>>
) {
  if (setSuccess) setSuccess(false)
  const data = { ...object }
  data[key] = value
  setObject(data)
}
