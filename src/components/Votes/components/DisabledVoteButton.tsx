import { Button } from "@/components/ui/button";

interface DisabledVoteButtonProps {
  reason: string;
}

export function DisabledVoteButton({ reason }: DisabledVoteButtonProps) {
  return (
    <Button className="w-full" disabled>
      {reason}
    </Button>
  );
}
