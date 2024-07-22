import { Delegation } from "@/app/api/common/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import { HStack, VStack } from "@/components/Layout/Stack";
import DelegationFromRow from "./DelegationFromRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DelegationsContainer({
  delegatees,
  delegators,
}: {
  delegatees: Delegation[];
  delegators: Delegation[];
}) {
  if (delegatees.length === 0 && delegators.length === 0) {
    return (
      <div className="p-8 text-center align-middle bg-wash rounded-md">
        No advanced delegations found
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <Tabs className="max-w-full mb-8" defaultValue="delegatedFrom">
        <HStack className="items-center justify-between">
          <TabsList>
            <TabsTrigger className="text-2xl" value="delegatedFrom">
              Delegated from
            </TabsTrigger>
            <TabsTrigger className="text-2xl" value="delegatedTo">
              Delegated to
            </TabsTrigger>
          </TabsList>
          <div className="hidden px-3 py-1 text-xs font-medium rounded-full text-secondary bg-wash sm:block">
            Advanced delegation beta
          </div>
        </HStack>
        <TabsContent value="delegatedFrom" className="max-w-full">
          <VStack gap={3} className="border shadow-sm rounded-xl border-line">
            <Table>
              <TableHeader className="text-xs text-secondary">
                <TableRow>
                  <TableHead className="h-10">Allowance</TableHead>
                  <TableHead className="h-10">Delegated on</TableHead>
                  <TableHead className="h-10">Type</TableHead>
                  <TableHead className="h-10">Amount</TableHead>
                  <TableHead className="h-10">From</TableHead>
                  <TableHead className="h-10">Txn Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegators.length === 0 ? (
                  <div className="w-full p-4">None found</div>
                ) : (
                  delegators.map((delegation) => (
                    <DelegationFromRow
                      key={delegation.from}
                      delegation={delegation}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </VStack>
        </TabsContent>
        <TabsContent value="delegatedTo">
          <VStack gap={3} className="border shadow-sm rounded-xl border-line">
            <Table>
              <TableHeader className="text-xs text-secondary">
                <TableRow>
                  <TableHead className="h-10">Allowance</TableHead>
                  <TableHead className="h-10">Delegated on</TableHead>
                  <TableHead className="h-10">Type</TableHead>
                  <TableHead className="h-10">Amount</TableHead>
                  <TableHead className="h-10">To</TableHead>
                  <TableHead className="h-10">Txn Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegatees.length === 0 ? (
                  <div className="w-full p-4">None found</div>
                ) : (
                  delegatees.map((delegation) => (
                    <DelegationToRow
                      key={delegation.to}
                      delegation={delegation}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </VStack>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DelegationsContainer;
