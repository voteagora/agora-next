import Image from "next/image";
import logo from "@/assets/agora_logo.svg";

interface ResourceNotFoundProps {
  message?: string;
}

export default function ResourceNotFound({ message }: ResourceNotFoundProps) {
  const defaultMessage = "Hmm. Can't find what you're looking for.";
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image
        className={"my-4"}
        alt="loading"
        width={24}
        height={24}
        src={logo}
      />

      <p className="text-md text-stone-600">{message || defaultMessage}</p>
    </div>
  );
}
