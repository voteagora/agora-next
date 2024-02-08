import { HStack, VStack } from "@/components/Layout/Stack";
import badge from "@/icons/badge.svg";
import sunny from "@/icons/sunny.svg";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata() {
  return {
    title: "Agora - Optimism's RetroPGF Round 3 Summary",
    description:
      "See which of your favourite projects were allocated in Optimism's RetroPGF Round 3.",
  };
}

export default function Page() {
  return (
    <VStack className="w-full items-stretch max-w-6xl pb-16 mt-12">
      <div className="mb-16 justify-between items-center flex flex-col gap-8 sm:flex-row sm:gap-0">
        <VStack>
          <h1 className="text-2xl font-extrabold mb-2">
            RetroPGF 3 results in numbers
          </h1>
          <div className="max-w-lg text-gray-700">
            For detailed data, check out the repo for the results calculation
            logic, or dive into the results data directly in a spreadsheet.
          </div>
        </VStack>
        <div className="h-auto sm:h-16 w-full sm:w-auto flex flex-col sm:flex-row items-center rounded-lg border border-gray-300 shadow-newDefault">
          {" "}
          <Link href="/retropgf/3">
            <HStack className="items-center gap-2 p-4 sm:border-r sm:border-r-gray-300 text-gray-700 hover:text-black transition-colors duration-200">
              <Image src={sunny} alt="Github" width="32" />
              <div className="max-w-[10rem]">View all recipients</div>
            </HStack>
          </Link>
          <a
            href="https://github.com/voteagora/rpgf_calculator/"
            target="_blank"
            rel="noreferrer"
          >
            <HStack className="items-center gap-2 p-4 sm:border-r sm:border-r-gray-300 text-gray-700 hover:text-black transition-colors duration-200">
              <Image
                src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-social-github-512.png"
                alt="Github"
                width="32"
                height="32"
              />
              <div className="max-w-[10rem]">Results Calculation</div>
            </HStack>
          </a>
          <a
            href="https://docs.google.com/spreadsheets/d/1h6hPbRE5w8iJxVhxOSYvkMYz-HC6-lePOegXw-usW5Q"
            target="_blank"
            rel="noreferrer"
          >
            <HStack className="gap-2 items-center p-4 text-gray-700 hover:black transition-colors duration-200">
              <Image
                src="https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_google_sheets-512.png"
                alt="Sheets"
                width="32"
                height="32"
              />
              <div className="max-w-[10rem]">Results data</div>
            </HStack>
          </a>
        </div>
      </div>
      <VStack className="gap-16">
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              How many ballots did projects appear in?
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_2.png"
            alt="RetroPGF 3 results 2"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              Distribution of OP allocation for top 30 projects
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_3.png"
            alt="RetroPGF 3 results 3"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              Individual vs projects comparison
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_4.png"
            alt="RetroPGF 3 results 4"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              Total OP allocated to each category
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_5.png"
            alt="RetroPGF 3 results 5"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              Funding for projects in each category
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_9.png"
            alt="RetroPGF 3 results 9"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              Collective Governance OP distribution
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_6.png"
            alt="RetroPGF 3 results 6"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              Developer Ecosystem OP distribution
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_7.png"
            alt="RetroPGF 3 results 7"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
        <VStack className="gap-1">
          <HStack className="justify-between">
            <div className="text-2xl font-extrabold">
              End UX and adoption OP distribution
            </div>
          </HStack>
          <Image
            src="/rpgf/infographic_8.png"
            alt="RetroPGF 3 results 8"
            className="w-full max-w-6xl rounded-xl border border-gray-300"
            height="1216"
            width="1216"
          />
        </VStack>
      </VStack>
      <Link
        href="/retropgf/3"
        className="fixed bottom-16 z-50 p-4 bg-white rounded-md shadow-md border border-gray-300"
      >
        <HStack className="gap-2">
          <Image src={badge} alt="badge symbol" />
          <span className="font-medium">View all RPGF recipients &#8594;</span>
        </HStack>
      </Link>
    </VStack>
  );
}
