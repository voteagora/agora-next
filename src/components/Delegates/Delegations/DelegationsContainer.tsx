"use client";

import { Delegation } from "@/app/api/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import DelegationFromRow from "./DelegationFromRow";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";

const displayModeSelectorStyles = css`
  cursor: pointer;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.gray["600"]};
  padding: ${theme.spacing["1"]} ${theme.spacing["3"]};
  border-radius: ${theme.borderRadius.full};

  :hover {
    background: ${theme.colors.gray["100"]};
    color: ${theme.colors.gray["900"]};
  }
`;

const displayModeSelectorSelectedStyles = css`
  background: ${theme.colors.gray.eb};
  color: ${theme.colors.gray["900"]};
  border-radius: ${theme.borderRadius.full};

  :hover {
    background: ${theme.colors.gray.eb};
  }
`;

function DelegationsContainer({
  delegatees,
  delegators,
}: {
  delegatees: Delegation[];
  delegators: Delegation[];
}) {
  const [tab, setTab] = useState<"from" | "to">("from");

  if (delegatees.length === 0 && delegators.length === 0) {
    return (
      <div className="mb-8 p-8 rounded-md bg-gray-100">
        No advanced delegations found
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold">Advanced Delegations</h2>
      <VStack className="my-8">
        <Tab.Group
          manual
          selectedIndex={(() => {
            switch (tab) {
              case "from":
                return 0;

              case "to":
                return 1;
            }
          })()}
          onChange={(index) => {
            switch (index) {
              case 0:
                setTab("from");
                return;

              case 1:
                setTab("to");
                return;
            }
          }}
        >
          <Tab.List>
            <HStack gap={1}>
              <Tab>
                {({ selected }) => (
                  <div
                    className={css`
                      ${displayModeSelectorStyles}
                      ${selected && displayModeSelectorSelectedStyles}
                    `}
                  >
                    Delegated from {delegators.length}
                  </div>
                )}
              </Tab>

              <Tab>
                {({ selected }) => (
                  <div
                    className={css`
                      ${displayModeSelectorStyles}
                      ${selected && displayModeSelectorSelectedStyles}
                    `}
                  >
                    Delegated to {delegatees.length}
                  </div>
                )}
              </Tab>
            </HStack>
          </Tab.List>
        </Tab.Group>

        {(() => {
          switch (tab) {
            case "from":
              return (
                <VStack>
                  {delegators.map((delegation) => (
                    <DelegationFromRow
                      key={delegation.from}
                      delegation={delegation}
                    />
                  ))}
                </VStack>
              );

            case "to":
              return (
                <VStack>
                  {delegatees.map((delegation) => (
                    <DelegationToRow
                      key={delegation.to}
                      delegation={delegation}
                    />
                  ))}
                </VStack>
              );
          }
        })()}
      </VStack>
    </>
  );
}

export default DelegationsContainer;
