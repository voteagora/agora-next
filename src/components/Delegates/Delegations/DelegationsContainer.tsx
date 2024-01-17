import { Delegation } from "@/app/api/delegations/delegation";
import DelegationToRow from "./DelegationToRow";
import { HStack, VStack } from "@/components/Layout/Stack";
import DelegationFromRow from "./DelegationFromRow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
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
      <div className="p-8 align-middle text-center rounded-md bg-gray-100">
        No advanced delegations found
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <Tabs className="mb-8 max-w-full" defaultValue="delegatedFrom">
        <HStack className="justify-between items-center">
          <TabsList>
            <TabsTrigger className="text-2xl" value="delegatedFrom">
              Delegated from
            </TabsTrigger>
            <TabsTrigger className="text-2xl" value="delegatedTo">
              Delegated to
            </TabsTrigger>
          </TabsList>
          <div className="text-slate-700 text-xs px-3 py-1 font-medium bg-slate-100 rounded-full lg:block hidden">
            Advanced delegation beta
          </div>
        </HStack>
        <TabsContent value="delegatedFrom" className="max-w-full">
          <VStack
            gap={3}
            className="rounded-xl border border-gray-eb shadow-sm"
          >
            <Table>
              <TableHeader className="text-xs text-slate-700">
                <TableRow>
                  <TableHead className="h-10">Allowance</TableHead>
                  <TableHead className="h-10">Delegated on</TableHead>
                  <TableHead className="h-10">Type</TableHead>
                  <TableHead className="h-10">Amount</TableHead>
                  <TableHead className="h-10">From</TableHead>
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
          <VStack
            gap={3}
            className="rounded-xl border border-gray-eb shadow-sm"
          >
            <Table>
              <TableHeader className="text-xs text-slate-700">
                <TableRow>
                  <TableHead className="h-10">Allowance</TableHead>
                  <TableHead className="h-10">Delegated on</TableHead>
                  <TableHead className="h-10">Type</TableHead>
                  <TableHead className="h-10">Amount</TableHead>
                  <TableHead className="h-10">To</TableHead>
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
