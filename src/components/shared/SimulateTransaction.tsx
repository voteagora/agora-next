"use client";

import { useState } from "react";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { BigNumberish, ethers } from "ethers";
import { icons } from "../../icons/icons";
import Image from "next/image";
import { Button } from "../ui/button";
import { HStack } from "../Layout/Stack";
import { opAdminAddress } from "@/lib/contracts/contracts";

type Status = "Unconfirmed" | "Valid" | "Invalid";

export default function SimulateTransaction({
  target,
  value,
  calldata,
}: {
  target: string;
  value: BigNumberish;
  calldata: string;
}) {
  const [status, setStatus] = useState<Status>("Unconfirmed");
  const [isLoading, setIsLoading] = useState(false);

  // Calldata example:
  // 0xa9059cbb00000000000000000000000037f1d6f468d31145960523687df6af7d7ff61e330000000000000000000000000000000000000000000000000000000000000064
  // 0x4200000000000000000000000000000000000042

  async function simulate() {
    // call tha backend /simulate endpoint
    if (ethers.isAddress(target)) {
      setIsLoading(true);

      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            target,
            value: value.toString(),
            calldata,
            networkId: "10",
            from: opAdminAddress,
          }),
        });

        const res = await response.json();

        if (res.response.transaction.status) {
          setStatus("Valid");
        } else {
          setStatus("Invalid");
        }
      } catch (e) {
        setStatus("Invalid");
      }

      setIsLoading(false);
    } else {
      setStatus("Invalid");
    }
  }

  return (
    <HStack
      alignItems="items-center"
      className={css`
        height: 100%;
        border: ${theme.spacing.px} solid ${theme.colors.gray.eb};
        border-radius: ${theme.borderRadius.md};
      `}
    >
      <p
        className={css`
          width: 70%;
          margin-left: ${theme.spacing["4"]};
          font-weight: 600;
          color: ${status === "Valid"
            ? theme.colors.green[500]
            : status === "Invalid"
            ? theme.colors.red[500]
            : theme.colors.gray["4f"]};
        `}
      >
        {status}
      </p>
      <Button
        variant="outline"
        className={css`
          width: 30%;
          padding: ${theme.spacing["1"]};
          margin-right: ${theme.spacing["2"]};
        `}
        onClick={() => {
          !isLoading && simulate();
        }}
        type="button"
      >
        {isLoading ? (
          <Image
            src={icons.spinner}
            alt={icons.spinner}
            className={css`
              margin: 0 auto;
            `}
          />
        ) : (
          "Simulate"
        )}
      </Button>
    </HStack>
  );
}
