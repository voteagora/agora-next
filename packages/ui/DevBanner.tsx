export default function DevBanner() {
  return (
    <div className="bg-black p-2 text-center">
      <p className="text-sm text-red-600">{process.env.AGORA_ENV}</p>
    </div>
  )
}
