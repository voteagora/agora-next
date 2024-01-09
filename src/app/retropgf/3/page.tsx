import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VStack } from "@/components/Layout/Stack";

// TODO: frh -> filters
export async function getRetroPGFResults() {
  const query = `
    query {
      retroPGF {
        projects(first: 10) {
          edges {
            node {
              id
              impactCategory
              displayName
              includedInBallots
            }
          }
        }
      }
    }
  `;

  // TODO: frh -> url
  const url = "https://optimism-agora-dev.agora-dev.workers.dev/graphql";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(url, options);
  const data = await response.json();

  return data.data.retroPGF.projects.edges;
}

export default async function Page() {
  const results = await getRetroPGFResults();
  console.log("results: ", results);
  return (
    <VStack className="my-8 max-w-6xl rounded-xl border border-gray-300 shadow-newDefault overflow-hidden">
      <Table>
        <TableHeader className="border-none">
          <TableRow className="border-none">
            <TableHead className="text-xs" variant="gray">
              Project
            </TableHead>
            <TableHead className="text-xs" variant="gray">
              Submitted by
            </TableHead>
            <TableHead className="text-xs" variant="gray">
              Categories
            </TableHead>
            <TableHead className="text-xs text-right" variant="gray">
              In ballots
            </TableHead>
            <TableHead className="text-xs text-right" variant="gray">
              In lists
            </TableHead>
            <TableHead className="text-xs text-right" variant="gray">
              Amount received
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="border-none">
            <TableCell>Allowance</TableCell>
            <TableCell>Allowance</TableCell>
            <TableCell>Allowance</TableCell>
            <TableCell className="text-right">Allowance</TableCell>
            <TableCell className="text-right">Allowance</TableCell>
            <TableCell className="text-right">Allowance</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Allowance</TableCell>
            <TableCell>Allowance</TableCell>
            <TableCell>Allowance</TableCell>
            <TableCell className="text-right">Allowance</TableCell>
            <TableCell className="text-right">Allowance</TableCell>
            <TableCell className="text-right">Allowance</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </VStack>
  );
}
