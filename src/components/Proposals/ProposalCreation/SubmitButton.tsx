import { css, cx } from "@emotion/css";
import { Form } from "./CreateProposalForm";
import { ethers, AbiCoder } from "ethers";
import * as theme from "@/styles/theme";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  OptimismContracts,
  approvalModuleAddress,
} from "@/lib/contracts/contracts";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

const abiCoder = new AbiCoder();
const governorTokenContract = OptimismContracts.governor;
const governanceTokenContract = OptimismContracts.token;

export default function SubmitButton({
  formTarget,
  form,
}: {
  formTarget: React.RefObject<HTMLFormElement>;
  form: Form;
}) {
  const { governorFunction, inputData } = getInputData(form);
  const { address } = useAccount();
  const { open } = useWeb3Modal();

  const { config, isError: onPrepareError } = usePrepareContractWrite({
    address: governorTokenContract.address as any,
    abi: governorTokenContract.abi,
    functionName: governorFunction,
    args: inputData as any,
  });

  const { data, isLoading, isSuccess, isError, write } =
    useContractWrite(config);

  const openDialog = useOpenDialog();

  function submitProposal() {
    write?.();
    openDialog({
      type: "CAST_PROPOSAL",
      params: {
        isLoading,
        isError,
        isSuccess,
        txHash: data?.hash,
      },
    });
  }

  useEffect(() => {
    if (isSuccess || isError || isLoading || data?.hash) {
      openDialog({
        type: "CAST_PROPOSAL",
        params: {
          isLoading,
          isError,
          isSuccess,
          txHash: data?.hash,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isError, isSuccess, data?.hash]);

  return (
    <Button
      type="submit"
      variant={"outline"}
      disabled={isLoading || onPrepareError}
      className={cx([
        css`
          width: 40%;
        `,
        onPrepareError &&
          css`
            background: ${theme.colors.gray.eb} !important;
            cursor: not-allowed;
          `,
      ])}
      onClick={(e) => {
        e.preventDefault();
        if (!address) {
          open();
          return;
        }
        if (formTarget.current?.checkValidity() && !onPrepareError) {
          formTarget.current?.reportValidity();
          submitProposal();
        }
      }}
    >
      {address ? "Submit proposal" : "Connect wallet"}
    </Button>
  );
}

type BasicInputData = [string[], BigInt[], string[], string];
type ApprovalInputData = [string, string, string];
type InputData = BasicInputData | ApprovalInputData;

function getInputData(form: Form): {
  governorFunction: "propose" | "proposeWithModule";
  inputData: InputData;
} {
  const description = "# " + form.state.title + "\n" + form.state.description;
  let governorFunction: "propose" | "proposeWithModule" = "propose";

  // provide default values for basic proposal
  let targets: string[] = [];
  let values: BigInt[] = [];
  let calldatas: string[] = [];
  let inputData: InputData = [targets, values, calldatas, description];

  try {
    // if basic proposal, format data for basic proposal
    if (form.state.proposalType === "Basic") {
      governorFunction = "propose";

      if (form.state.options[0].transactions.length === 0) {
        targets.push(ethers.ZeroAddress);
        values.push(BigInt(0));
        calldatas.push("0x");
      } else {
        form.state.options[0].transactions.forEach((t) => {
          if (t.type === "Transfer") {
            targets.push(governanceTokenContract.address);
            values.push(BigInt(0));
            calldatas.push(encodeTransfer(t.transferTo, t.transferAmount));
          } else {
            targets.push(ethers.getAddress(t.target));
            values.push(ethers.parseEther(t.value.toString() || "0"));
            calldatas.push(t.calldata);
          }
        });
      }
    } else {
      // if approval proposal, format data for approval proposal
      governorFunction = "proposeWithModule";
      let options: [string[], BigInt[], string[], string][] = [];

      form.state.options.forEach((option) => {
        const formattedOption: [string[], BigInt[], string[], string] = [
          [],
          [],
          [],
          option.title,
        ];

        option.transactions.forEach((t) => {
          if (t.type === "Transfer") {
            formattedOption[0].push(governanceTokenContract.address);
            formattedOption[1].push(BigInt(0));
            formattedOption[2].push(
              encodeTransfer(t.transferTo, t.transferAmount)
            );
          } else {
            formattedOption[0].push(ethers.getAddress(t.target));
            formattedOption[1].push(
              ethers.parseEther(t.value.toString() || "0")
            );
            formattedOption[2].push(t.calldata);
          }
        });

        options.push(formattedOption);
      });

      const settings = [
        form.state.maxOptions,
        form.state.criteriaType === "Threshold" ? 0 : 1,
        form.state.budget > 0
          ? governanceTokenContract.address
          : ethers.ZeroAddress,
        form.state.criteriaType === "Threshold"
          ? ethers.parseEther(form.state.threshold.toString())
          : form.state.topChoices,
        ethers.parseEther(form.state.budget.toString()),
      ];

      inputData = [
        approvalModuleAddress,
        abiCoder.encode(
          [
            "tuple(address[],uint256[],bytes[],string)[]",
            "tuple(uint8,uint8,address,uint128,uint128)",
          ],
          [options, settings]
        ),
        description,
      ];
    }
  } catch (e) {
    console.error(e);
  }

  return { governorFunction, inputData };
}

function encodeTransfer(to: string, amount: number): string {
  return (
    "0xa9059cbb" +
    abiCoder
      .encode(
        ["address", "uint256"],
        [ethers.getAddress(to), ethers.parseEther(amount.toString() || "0")]
      )
      .slice(2)
  );
}
