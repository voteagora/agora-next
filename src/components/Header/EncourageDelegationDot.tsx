import { useProfileData } from "@/hooks/useProfileData";

const EncourageDelegationDot = ({ className }: { className?: string }) => {
  const { tokenBalance, delegate } = useProfileData();
  const votingPower = delegate?.votingPower;
  const shouldIndicate =
    tokenBalance && tokenBalance !== BigInt(0) && votingPower?.total === "0";
  if (!shouldIndicate) return null;
  return (
    <div
      className={`w-[10px] h-[10px] bg-negative rounded-full absolute ${className || ""}`}
    />
  );
};

export default EncourageDelegationDot;
