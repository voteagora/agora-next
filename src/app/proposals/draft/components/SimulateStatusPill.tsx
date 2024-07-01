import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SimulationStatusPill = ({
  status,
  simulationId,
}: {
  status: string;
  simulationId: string | null;
}) => {
  return (
    <span
      className={cn(
        "relative border rounded-lg p-2",
        status === "UNCONFIRMED" &&
          "bg-yellow-100 border-yellow-500 text-yellow-500",
        status === "VALID" && "bg-green-100 border-green-500 text-green-500",
        status === "INVALID" && "bg-red-100 border-red-500 text-red-500"
      )}
    >
      {status}
      {simulationId && (
        <div className="absolute right-2 top-3 cursor-pointer">
          <a
            href={`https://tdly.co/shared/simulation/${simulationId}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image src={icons.link} height="16" width="16" alt="link icon" />
          </a>
        </div>
      )}
    </span>
  );
};

export default SimulationStatusPill;
