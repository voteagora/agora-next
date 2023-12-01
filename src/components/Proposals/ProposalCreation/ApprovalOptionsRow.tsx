"use client";

import { css } from "@emotion/css";
import { Form } from "./CreateProposalForm";
import * as theme from "@/styles/theme";
import { XCircleIcon } from "@heroicons/react/20/solid";
import styles from "./styles.module.scss";
import { VStack } from "@/components/Layout/Stack";
import InputBox from "@/components/shared/InputBox";
import { Button } from "@/components/ui/button";
import AddTransactionsDetails from "./AddTransactionsDetails";

export default function ApprovalOptionsRow({ form }: { form: Form }) {
  function addOption() {
    form.onChange.options([
      ...form.state.options,
      {
        title: "",
        transactions: [],
      },
    ]);
  }

  function update(index: number, next: Partial<Form["state"]["options"][0]>) {
    form.onChange.options(
      form.state.options.map((option, i) => {
        if (i === index) {
          return {
            ...option,
            ...next,
          };
        }
        return option;
      })
    );
  }

  function remove(index: number) {
    form.onChange.options(form.state.options.filter((_, i) => i !== index));
  }

  return (
    <>
      <h4 className={styles.create_prop_form__heading}>Proposed Options</h4>
      <p
        className={css`
          font-size: ${theme.fontSize.base};
          color: ${theme.colors.gray["4f"]};
          margin-bottom: ${theme.spacing["4"]};
        `}
      >
        Proposed transactions will execute if your proposal passes. If you skip
        this step no transactions will be added.
      </p>
      {form.state.options.map((_option, index) => (
        <VStack
          gap={4}
          key={index}
          className={css`
            position: relative;
          `}
        >
          <p
            className={css`
              font-weight: 600;
            `}
          >
            Option {index + 1}
          </p>
          <VStack
            className={css`
              width: 100%;
              padding-left: ${theme.spacing["5"]};
              margin-bottom: ${theme.spacing["8"]};
              border-left: 1px solid ${theme.colors.gray.eb};
            `}
          >
            <label className={styles.create_prop_form__label}>Title</label>
            <InputBox
              placeholder={"My option title"}
              value={form.state.options[index].title}
              onChange={(next) => update(index, { title: next })}
              required
            />
            <AddTransactionsDetails optionIndex={index} form={form} />
          </VStack>
          {form.state.options.length > 1 && (
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
          )}
        </VStack>
      ))}
      <Button variant="outline" type="button" onClick={addOption}>
        Add option
      </Button>
    </>
  );
}
