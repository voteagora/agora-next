"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { icons } from "../../icons/icons";
import Image from "next/image";
import { Button } from "../ui/button";
import { HStack } from "../Layout/Stack";
import { opAdminAddress } from "@/lib/contracts/contracts";
import styles from "./styles.module.scss";

type Status = "Unconfirmed" | "Valid" | "Invalid";

export default function SimulateTransaction({
  target,
  value,
  calldata,
}: {
  target: string;
  value: BigInt;
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
    <HStack alignItems="items-center" className={styles.simulate}>
      <p
        className={
          status === "Valid"
            ? styles.valid
            : status === "Invalid"
              ? styles.invalid
              : styles.else_color
        }
      >
        {status}
      </p>
      <Button
        variant="outline"
        className={styles.simulate__button}
        onClick={() => {
          !isLoading && simulate();
        }}
        type="button"
      >
        {isLoading ? (
          <Image
            src={icons.spinner}
            alt={icons.spinner}
            className={styles.simulate__image}
          />
        ) : (
          "Simulate"
        )}
      </Button>
    </HStack>
  );
}
