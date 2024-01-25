"use client";

import { cx } from "@emotion/css";
import { Form } from "./CreateProposalForm";
import { ethers, AbiCoder } from "ethers";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  OptimismContracts,
  approvalModuleAddress,
  optimisticModuleAddress,
} from "@/lib/contracts/contracts";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";
import { useModal } from "connectkit";
import styles from "./styles.module.scss";
import { disapprovalThreshold } from "@/lib/constants";

const abiCoder = new AbiCoder();
const governorContract = OptimismContracts.governor;
const governanceTokenContract = OptimismContracts.token;

export default function SubmitButton({
  formTarget,
  form,
}: {
  formTarget: React.RefObject<HTMLFormElement>;
  form: Form;
}) {
  const { governorFunction, inputData } = getInputData(form);
  const { isConnected } = useAccount();
  const { setOpen } = useModal();
  const [isClient, setIsClient] = useState(false);

  const { config, isError: onPrepareError } = usePrepareContractWrite({
    address: governorContract.address as any,
    abi: governorContract.abi,
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

  /* hack to suppress Suspense boundary error */
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Button
      type="submit"
      variant={"outline"}
      disabled={isLoading || onPrepareError}
      className={cx(["w-[40%]", onPrepareError && styles.submit_button])}
      onClick={(e) => {
        e.preventDefault();
        if (!isConnected) {
          setOpen(true);
          return;
        }
        if (formTarget.current?.checkValidity() && !onPrepareError) {
          formTarget.current?.reportValidity();
          submitProposal();
        }
      }}
    >
      {/* hack to suppress Suspense boundary error */}
      {isClient && isConnected ? "Submit proposal" : "Connect wallet"}
    </Button>
  );
}

type BasicInputData = [string[], bigint[], string[], string, Number];
type ApprovalInputData = [string, string, string, Number];
type InputData = BasicInputData | ApprovalInputData;

function getInputData(form: Form): {
  governorFunction: "propose" | "proposeWithModule";
  inputData: InputData;
} {
  const description = "# " + form.state.title + "\n" + form.state.description;
  let governorFunction: "propose" | "proposeWithModule" = "propose";

  // provide default values for basic proposal
  let targets: string[] = [];
  let values: bigint[] = [];
  let calldatas: string[] = [];
  // TODO
  let proposalSettings = Number(form.state.proposalSettings); // index as uint8 as last argument on propose and proposeWithModule
  let inputData: InputData = [
    targets,
    values,
    calldatas,
    description,
    proposalSettings,
  ];

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
    } else if (form.state.proposalType === "Approval") {
      // if APPROVAL proposal, format data for approval proposal
      governorFunction = "proposeWithModule";
      // first bigint is the sum of all op transfer per option
      let options: [bigint, string[], bigint[], string[], string][] = [];

      form.state.options.forEach((option) => {
        const formattedOption: [bigint, string[], bigint[], string[], string] =
          [BigInt(0), [], [], [], option.title];

        option.transactions.forEach((t) => {
          if (t.type === "Transfer") {
            formattedOption[0] += BigInt(t.transferAmount);
            formattedOption[1].push(governanceTokenContract.address);
            formattedOption[2].push(BigInt(0));
            formattedOption[3].push(
              encodeTransfer(t.transferTo, t.transferAmount)
            );
          } else {
            formattedOption[1].push(ethers.getAddress(t.target));
            formattedOption[2].push(
              ethers.parseEther(t.value.toString() || "0")
            );
            formattedOption[3].push(t.calldata);
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
            "tuple(uint256,address[],uint256[],bytes[],string)[]",
            "tuple(uint8,uint8,address,uint128,uint128)",
          ],
          [options, settings]
        ),
        description,
        proposalSettings,
      ];
    } else if (form.state.proposalType === "Optimistic") {
      // if OPTIMISTIC proposal, format data for optimistic proposal
      governorFunction = "proposeWithModule";

      const settings = [disapprovalThreshold * 100, true];

      inputData = [
        optimisticModuleAddress,
        abiCoder.encode(["tuple(uint248,bool)"], [settings]),
        description,
        proposalSettings,
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
