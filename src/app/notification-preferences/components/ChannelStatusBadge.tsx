import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ChannelStatus = "connected" | "pending" | "disconnected";

interface ChannelStatusBadgeProps {
  status: ChannelStatus;
  label?: string;
}

const STATUS_LABELS: Record<ChannelStatus, string> = {
  connected: "Connected",
  pending: "Pending",
  disconnected: "Not connected",
};

const STATUS_STYLES: Record<ChannelStatus, string> = {
  connected: "border-positive/30 bg-positive/10 text-positive",
  pending: "border-line bg-neutral text-secondary",
  disconnected: "border-line bg-neutral text-tertiary",
};

export default function ChannelStatusBadge({
  status,
  label,
}: ChannelStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold", STATUS_STYLES[status])}
    >
      {label ?? STATUS_LABELS[status]}
    </Badge>
  );
}
