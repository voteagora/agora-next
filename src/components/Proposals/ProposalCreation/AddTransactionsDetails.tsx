"use client";

import { css, cx } from "@emotion/css";
import { HStack, VStack } from "@/components/Layout/Stack";
import * as theme from "@/styles/theme";
import { Form, Transaction } from "./CreateProposalForm";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { ethers } from "ethers";
import { PlusIcon } from "@heroicons/react/20/solid";
import InputBox from "@/components/shared/InputBox";
import styles from "./styles.module.scss";
import { MultiButtons } from "@/components/shared/MultiButtons";

export default function AddTransactionsDetails({
  form,
  optionIndex,
}: {
  form: Form;
  optionIndex: number;
}) {
  const addTransaction = (type: "Transfer" | "Custom") => {
    form.onChange.options(
      form.state.options.map((option, i) => {
        if (i === optionIndex) {
          return {
            ...option,
            transactions: [
              ...option.transactions,
              {
                type,
                target: "",
                value: 0,
                calldata: "",
                transferAmount: 0,
                transferTo: "",
              },
            ],
          };
        }
        return option;
      })
    );
  };

  const update = (index: number, next: Partial<Transaction>) => {
    const transactions = [...form.state.options[optionIndex].transactions];
    transactions[index] = {
      ...transactions[index],
      ...next,
    };
    return form.state.options.map((option, i) => {
      if (i === optionIndex) {
        return {
          ...option,
          transactions,
        };
      }
      return option;
    });
  };

  const remove = (index: number) => {
    const transactions = [...form.state.options[optionIndex].transactions];
    transactions.splice(index, 1);
    form.onChange.options(
      form.state.options.map((option, i) => {
        if (i === optionIndex) {
          return {
            ...option,
            transactions,
          };
        }
        return option;
      })
    );
  };

  return (
    <>
      {form.state.options[optionIndex].transactions.length === 0 && (
        <MultiButtons
          buttonsProps={[
            [
              "Transfer tokens from the treasury",
              () => addTransaction("Transfer"),
            ],
            ["Custom transaction", () => addTransaction("Custom")],
          ]}
        />
      )}
      {form.state.options[optionIndex].transactions.map(
        (transaction, index) => (
          <VStack
            key={index}
            className={css`
              margin-top: ${theme.spacing["4"]};
              width: 100%;
              position: relative;
            `}
          >
            <p
              className={css`
                font-weight: 600;
                margin-top: ${theme.spacing["2"]};
                margin-bottom: ${theme.spacing["4"]};
              `}
            >
              Transaction {index + 1}
            </p>
            {transaction.type === "Transfer" && (
              <>
                <HStack
                  className={css`
                    width: 100%;
                    margin-bottom: ${theme.spacing["4"]};
                  `}
                  gap={4}
                >
                  <VStack
                    className={css`
                      width: 100%;
                    `}
                  >
                    <label className={labelStyle}>Transfer to</label>
                    <InputBox
                      placeholder={"address (no ENS)"}
                      value={transaction.transferTo}
                      onChange={(next) =>
                        form.onChange.options(
                          update(index, { transferTo: next })
                        )
                      }
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                  </VStack>
                  <VStack
                    className={css`
                      width: 100%;
                    `}
                  >
                    <label className={labelStyle}>
                      Transfer amount requested (OP)
                    </label>
                    <InputBox
                      placeholder={"3 000 000 OP"}
                      value={transaction.transferAmount}
                      type="number"
                      onChange={(next) =>
                        form.onChange.options(
                          update(index, { transferAmount: next })
                        )
                      }
                      required
                      min={0}
                    />
                  </VStack>
                </HStack>
              </>
            )}
            {transaction.type === "Custom" && (
              <>
                <HStack
                  className={css`
                    width: 100%;
                    margin-bottom: ${theme.spacing["4"]};
                  `}
                  gap={4}
                >
                  <VStack
                    className={css`
                      width: 100%;
                    `}
                  >
                    <label className={labelStyle}>Target</label>
                    <InputBox
                      placeholder={"address"}
                      value={transaction.target}
                      onChange={(next) =>
                        form.onChange.options(update(index, { target: next }))
                      }
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                  </VStack>
                  <VStack
                    className={css`
                      width: 100%;
                    `}
                  >
                    <label className={labelStyle}>Value</label>
                    <InputBox
                      placeholder={"uint256"}
                      value={transaction.value}
                      onChange={(next) =>
                        form.onChange.options(update(index, { value: next }))
                      }
                      type="number"
                      min={0}
                    />
                  </VStack>
                </HStack>
                <HStack
                  className={css`
                    width: 100%;
                    margin-bottom: ${theme.spacing["4"]};
                  `}
                  gap={4}
                >
                  <VStack
                    className={css`
                      width: 100%;
                    `}
                  >
                    <label className={labelStyle}>Calldata</label>
                    <InputBox
                      placeholder={"bytes"}
                      value={transaction.calldata}
                      onChange={(next) =>
                        form.onChange.options(update(index, { calldata: next }))
                      }
                    />
                  </VStack>
                  <VStack
                    className={css`
                      width: 100%;
                    `}
                  >
                    <label className={labelStyle}>Transaction Validity</label>
                    {/* <SimulateTransaction
                      target={transaction.target}
                      value={ethers.parseEther(
                        transaction.value.toString() || "0"
                      )}
                      calldata={transaction.calldata}
                    /> */}
                  </VStack>
                </HStack>
              </>
            )}
            <XCircleIcon
              className={css`
                width: 20px;
                height: 20px;
                position: absolute;
                top: 2px;
                right: 0;
                cursor: pointer;
                color: ${theme.colors.gray.eb};

                &:hover {
                  color: ${theme.colors.gray["4f"]};
                }
              `}
              onClick={() => remove(index)}
            />
          </VStack>
        )
      )}
      {form.state.options[optionIndex].transactions.length !== 0 && (
        <VStack
          className={css`
            padding: ${theme.spacing["4"]};
            border: 1px solid ${theme.colors.gray.eb};
            border-radius: ${theme.borderRadius.md};
            box-shadow: ${theme.boxShadow.sm};
            margin-top: ${theme.spacing["4"]};
            position: relative;
          `}
        >
          <p
            className={cx(
              styles.create_prop_form__heading,
              css`
                margin-bottom: 0;
              `
            )}
          >
            Add another transaction
          </p>
          <MultiButtons
            buttonsProps={[
              [
                "Transfer tokens from the treasury",
                () => addTransaction("Transfer"),
              ],
              ["Custom transaction", () => addTransaction("Custom")],
            ]}
          />
          <PlusIcon
            className={css`
              width: ${theme.spacing["5"]};
              height: ${theme.spacing["5"]};
              position: absolute;
              top: ${theme.spacing["4"]};
              right: ${theme.spacing["4"]};
              color: ${theme.colors.gray["4f"]};
            `}
          />
        </VStack>
      )}
    </>
  );
}

export const labelStyle = css`
  color: ${theme.colors.gray["4f"]};
  font-weight: 600;
  margin-bottom: ${theme.spacing["1"]};
  font-size: ${theme.fontSize.xs};
`;
