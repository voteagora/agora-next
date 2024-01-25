import { VStack } from "@/components/Layout/Stack";
import RetroPGFListRow from "./RetroPGFListRow";

{
  /* TODO: frh -> waiting for feedback on this page */
}
export default function RetroPGFApplicationListContainer({
  lists,
}: {
  lists: any;
}) {
  return (
    <VStack className="justify-between py-0 px-4">
      <h2 className="font-inter font-black text-2xl leading-[29px] text-black max-w-6xl">
        Included in lists
      </h2>
      <div className="w-full p-0 my-8 mx-0 shadow-newDefault rounded-xl border border-gray-eb max-h-[calc(100vh-148px)] flex-shrink-0">
        <div
        // className={css`
        //   & > div:last-child {
        //     border-bottom: none;
        //   }
        // `}
        >
          {lists.length === 0 && (
            <VStack className="items-center justify-center p-8 text-gray-700">
              Not included in any lists
            </VStack>
          )}
          {/* {lists.map((list, index) => (
            <RetroPGFListRow key={index} fragmentRef={list} />
          ))} */}
        </div>
      </div>
    </VStack>
  );
}
