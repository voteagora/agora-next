"use client";

import { Delegation } from "@/app/api/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Tab } from "@headlessui/react";
import { useState } from "react";
import DelegationFromRow from "./DelegationFromRow";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";

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
      <div className="mb-8 p-8 align-middle text-center rounded-md bg-gray-100">
        No advanced delegations found
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold">Advanced Delegations (beta)</h2>
      <Tabs className="my-8" defaultValue="delegatedFrom">
        <HStack className="justify-between align-center">
          <TabsList>
            <TabsTrigger value="delegatedFrom">Delegated from</TabsTrigger>
            <TabsTrigger value="delegatedTo">Delegated to</TabsTrigger>
          </TabsList>
          {/* <span className="font-medium text-gray-4f">
          240,120 OP from 80,024 Delegates
        </span> */}
        </HStack>
        <TabsContent value="delegatedFrom">
          <VStack
            gap={3}
            className="rounded-lg border border-gray-eb bg-white shadow"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allowance</TableHead>
                  <TableHead>Delegated on</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegators.map((delegation) => (
                  <DelegationFromRow
                    key={delegation.from}
                    delegation={delegation}
                  />
                ))}
              </TableBody>
            </Table>
          </VStack>
        </TabsContent>
        <TabsContent value="delegatedTo">
          <VStack
            gap={3}
            className="rounded-lg border border-gray-eb bg-white shadow"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allowance</TableHead>
                  <TableHead>Delegated on</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegatees.map((delegation) => (
                  <DelegationToRow
                    key={delegation.to}
                    delegation={delegation}
                  />
                ))}
              </TableBody>
            </Table>
          </VStack>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default DelegationsContainer;
