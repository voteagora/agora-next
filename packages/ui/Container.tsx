import clsx from "clsx"

type Props = {
  className?: string
  children: React.ReactNode
}

export default function Container({ className, children }: Props) {
  return (
    <div
      className={clsx("mx-auto w-full max-w-screen-lg px-4 md:px-8", className)}
    >
      {children}
    </div>
  )
}
