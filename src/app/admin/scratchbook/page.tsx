"use client";

import AnimatedText from "@/app/proposals/draft/components/AnimatedText";
import { useState } from "react";

const ScratchbookPage = () => {
  const [word1, setWord1] = useState("Hello");
  const [word2, setWord2] = useState("World");

  return (
    <div className="p-4 rounded-xl border border-line max-w-[500px] mx-auto mt-24">
      <div className="flex flex-col justify-center items-center h-[200px] w-full">
        <span className="text-3xl font-semibold mx-auto block">
          <AnimatedText textFrom={word1} textTo={word2} />
        </span>
      </div>
      <div className="bg-tertiary/10 px-4 pt-2 rounded-lg">
        <div className="border-b border-line pb-2 flex flex-row justify-between items-center">
          <span className="text-tertiary">Word 1</span>
          <input
            className="bg-transparent outline-none border-0 focus:outline-none border-transparent focus:border-transparent focus:ring-0"
            type="text"
            value={word1}
            onChange={(e) => setWord1(e.target.value)}
          />
        </div>
        <div className="flex flex-row justify-between items-center pb-2 mt-1">
          <span className="text-tertiary">Word 2</span>
          <input
            className="bg-transparent outline-none border-0 focus:outline-none border-transparent focus:border-transparent focus:ring-0"
            type="text"
            value={word2}
            onChange={(e) => setWord2(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ScratchbookPage;
