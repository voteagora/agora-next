import Image from "next/image";

interface ResourceNotFoundProps {
  message?: string;
}

export default function ResourceNotFound({ message }: ResourceNotFoundProps) {
  const defaultMessage = "Hmm. Can't find what you're looking for.";
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image
        className="my-4"
        src="/images/blink.gif"
        alt="Blinking Agora Logo"
        width={40}
        height={12}
      />
      <p className="text-md text-stone-600">{message || defaultMessage}</p>
    </div>
  );
}
