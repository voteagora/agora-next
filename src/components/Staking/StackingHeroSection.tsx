import React from "react";
import Image from "next/image";

const StackingHeroSection = () => {
  return (
    <div className="font-inter">
      <Image
        src="/images/staking_banner.png"
        alt="RetroPGF 3 results 2"
        className="w-full max-w-4xl rounded-xl"
        height="232"
        width="800"
      />
      <h1 className="text-2xl font-black text-black mt-6">
        Introducing staking, the next chapter of Uniswap Governance
      </h1>
      <p className="text-base text-gray-4f font-medium mt-2">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo.{" "}
      </p>
    </div>
  );
};
export default StackingHeroSection;
