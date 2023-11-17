import { Button } from "@/components/Button";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { css } from "@emotion/css";
import { useContractWrite } from "wagmi";

export function DelegateButton({ full, address }) {
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: OptimismContracts.token.address,
    abi: OptimismContracts.token.abi,
    functionName: "delegate",
    args: [address],
  });

  return (
    <Button
      onClick={() => {
        write();
      }}
      className={
        full &&
        css`
          width: 100%;
        `
      }
    >
      Delegate
    </Button>
  );
}
