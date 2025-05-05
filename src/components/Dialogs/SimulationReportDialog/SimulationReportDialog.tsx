import { StructuredSimulationReport } from "@/lib/seatbelt/types";
import { StructuredReport } from "@/components/Simulation/StructuredReport";

interface Props {
  report: StructuredSimulationReport | null;
  closeDialog: () => void;
}

export function SimulationReportDialog({ report }: Props) {
  if (!report) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-lg font-semibold">Simulation Report</div>
        <div className="text-sm text-secondary">
          No simulation report available.
        </div>
      </div>
    );
  }

  return <StructuredReport report={report} />;
}
