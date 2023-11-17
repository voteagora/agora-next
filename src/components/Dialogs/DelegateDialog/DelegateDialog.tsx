import * as theme from "@/styles/theme";
import { useAccount, useContractWrite } from "wagmi";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { css } from "@emotion/css";
import { ReactNode, useMemo } from "react";
import tokenIcon from "@/icons/tokenIcon.svg";
import { HStack, VStack } from "../../Layout/Stack";
import { OptimismContracts } from "@/lib/contracts/contracts";
import ENSName from "@/components/shared/ENSName";
import { formatNumber, tokens } from "@/lib/tokenUtils";
import Image from "next/image";

export function DelegateDialog({
  target,
  completeDelegation,
}: {
  target: string;
  completeDelegation: () => void;
}) {
  return (
    <VStack
      alignItems="items-center"
      className={css`
        padding: ${theme.spacing["8"]};
        overflow-y: scroll;
      `}
    >
      <div
        className={css`
          width: 100%;
          max-width: ${theme.maxWidth.md};
          background: ${theme.colors.white};
          border-radius: ${theme.spacing["3"]};
          padding: ${theme.spacing["6"]};
        `}
      >
        <DelegateDialogContents
          targetAccountAddress={target as any}
          completeDelegation={completeDelegation}
        />
      </div>
    </VStack>
  );
}

function OPAmountDisplay({ amount }: { amount: string }) {
  const formattedNumber = useMemo(() => {
    return formatNumber(amount, "optimism", 4);
  }, [amount]);

  return (
    <HStack
      gap={2}
      className={css`
        color: ${theme.colors.black};
        font-size: ${theme.fontSize["4xl"]};
        @media (max-width: ${theme.maxWidth.md}) {
          font-size: ${theme.fontSize["3xl"]};
        }
      `}
      alignItems="items-center"
    >
      <Image src={tokenIcon} alt={"OP"} width={32} height={32} />
      {formattedNumber} {tokens.optimism.symbol}
    </HStack>
  );
}

function DelegateDialogContents({
  targetAccountAddress,
  completeDelegation,
}: {
  targetAccountAddress: `0x${string}`;
  completeDelegation: () => void;
}) {
  const { address: accountAddress } = useAccount();

  const { data, isLoading, isSuccess, isError, write } = useContractWrite({
    address: OptimismContracts.token.address as any,
    abi: OptimismContracts.token.abi,
    functionName: "delegate",
    args: [targetAccountAddress],
  });

  return (
    <VStack gap={8} alignItems="items-stretch">
      <VStack
        gap={3}
        alignItems="items-center"
        className={css`
          padding-top: ${theme.spacing["3"]};
          padding-bottom: ${theme.spacing["3"]};
          border-radius: ${theme.spacing["2"]};
          background: rgba(250, 250, 250, 0.95);
          border: 1px solid ${theme.colors.gray.eb};

          color: #66676b;
          font-size: ${theme.fontSize.xs};
        `}
      >
        <VStack
          className={css`
            padding: ${theme.spacing["4"]} ${theme.spacing["12"]};
            @media (max-width: ${theme.maxWidth.md}) {
              padding: ${theme.spacing["2"]} ${theme.spacing["4"]};
            }
          `}
          alignItems="items-center"
          gap={3}
        >
          {(() => {
            if (true) {
              return <div>{`You don't have any tokens to delegate`}</div>;
            }

            // return (
            //   <>
            //     <div>Delegating your</div>

            //     <OPAmountDisplay fragment={currentAccount.amountOwned.amount} />
            //   </>
            // );
          })()}
        </VStack>

        <VStack
          className={css`
            width: 100%;
            z-index: 1;
            position: relative;
          `}
          alignItems="items-center"
        >
          <VStack
            justifyContent="justify-center"
            className={css`
              position: absolute;
              // @include inset0;
              z-index: -1;
            `}
          >
            <div
              className={css`
                height: 1px;
                background: ${theme.colors.gray.eb};
              `}
            />
          </VStack>

          <VStack
            className={css`
              width: ${theme.spacing["10"]};
              height: ${theme.spacing["10"]};
              background: ${theme.colors.white};
              border: 1px solid ${theme.colors.gray.eb};
              border-radius: ${theme.borderRadius.full};
              padding: ${theme.spacing["2"]};
              box-shadow-default;
            `}
          >
            <ArrowDownIcon
              className={css`
                color: black;
              `}
            />
          </VStack>
        </VStack>

        <VStack
          className={css`
            padding: ${theme.spacing["4"]} ${theme.spacing["12"]};
            @media (max-width: ${theme.maxWidth.md}) {
              padding: ${theme.spacing["2"]} ${theme.spacing["4"]};
            }
          `}
        >
          <div
            className={css`
              text-align: center;
            `}
          >
            To <ENSName address={targetAccountAddress} /> who represents
          </div>

          <OPAmountDisplay amount={"500000000000000000000000"} />
        </VStack>
      </VStack>
      {!accountAddress && (
        <w3m-button />
        //   {({ isConnected, show, address }) => {
        //     return (
        //       <button
        //         onClick={show}
        //         className={css`
        //           text-align: center;
        //           border-radius: ${theme.spacing["2"]};
        //           border: 1px solid ${theme.colors.gray.eb};
        //           font-weight: ${theme.fontWeight.semibold};
        //           padding: ${theme.spacing["4"]} 0;
        //           cursor: pointer;
        //           :hover {
        //             background: ${theme.colors.gray.eb};
        //           }
        //         `}
        //       >
        //         {isConnected ? address : "Connect your wallet"}
        //       </button>
        //     );
        //   }}
        // </w3m-button>
      )}
      {isLoading && (
        <DelegateButton disabled={false}>
          Submitting your delegation...
        </DelegateButton>
      )}
      {isSuccess && (
        <DelegateButton disabled={false}>Delegation completed!</DelegateButton>
      )}
      {isError && (
        <DelegateButton disabled={false}>Delegation failed</DelegateButton>
      )}
      {!isError && !isSuccess && !isLoading && accountAddress && (
        <DelegateButton disabled={false} onClick={() => write()}>
          Delegate your votes
        </DelegateButton>
      )}
    </VStack>
  );
}

type DelegateButtonProps = {
  onClick?: () => void;
  disabled: boolean;
  children: ReactNode;
};

const DelegateButton = ({
  children,
  disabled,
  onClick,
}: DelegateButtonProps) => {
  const effectiveOnClick = !disabled ? onClick : undefined;
  return (
    <div
      onClick={effectiveOnClick}
      className={css`
        text-align: center;
        border-radius: ${theme.spacing["2"]};
        border: 1px solid ${theme.colors.gray.eb};
        font-weight: ${theme.fontWeight.semibold};
        padding: ${theme.spacing["4"]} 0;
        cursor: pointer;

        ${!effectiveOnClick &&
        css`
          background: white;
          color: black;
          cursor: not-allowed;
        `}

        :hover {
          background: ${theme.colors.gray.eb};
        }
      `}
    >
      {children}
    </div>
  );
};
