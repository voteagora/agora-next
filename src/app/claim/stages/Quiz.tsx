import React from "react";
import Image from "next/image";
import ClaimQuiz from "../components/ClaimQuiz";

const QuizStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-theme-100 p-6">
          <div className="bg-[url('/images/scroll/scroll-vision.png')] bg-contain w-full h-44 rounded-lg"></div>
          <h1 className="font-black text-2xl mt-6">
            Scroll&apos;s vision and values
          </h1>
          <p className="mt-6 text-agora-theme-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu
            lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Aliquam eu lectus dignissim, porta
            tortor nec.Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Aliquam eu lectus dignissim, porta tortor nec.
          </p>
          <div className="mt-10 space-y-10">
            <div className="flex flex-row space-x-4 items-center">
              <Image
                src="/images/scroll/scroll-vision-1.png"
                width={144}
                height={144}
                alt="Scroll's vision and values"
              />
              <div className="flex flex-col">
                <h4 className="mb-4 font-medium">Empowering humanity</h4>
                <p className="text-agora-theme-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum
                  dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus
                  dignissim, porta tortor nec.
                </p>
              </div>
            </div>
            <div className="flex flex-row space-x-4 items-center">
              <Image
                src="/images/scroll/scroll-vision-2.png"
                width={144}
                height={144}
                alt="Scroll's vision and values"
              />
              <div className="flex flex-col">
                <h4 className="mb-4 font-medium">Building in the open</h4>
                <p className="text-agora-theme-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum
                  dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus
                  dignissim, porta tortor nec.
                </p>
              </div>
            </div>
            <div className="flex flex-row space-x-4 items-center">
              <Image
                src="/images/scroll/scroll-vision-3.png"
                width={144}
                height={144}
                alt="Scroll's vision and values"
              />
              <div className="flex flex-col">
                <h4 className="mb-4 font-medium">
                  Fighting for decentralization
                </h4>
                <p className="text-agora-theme-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum
                  dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus
                  dignissim, porta tortor nec.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="col-span-3">
        <div className="sticky top-4">
          <ClaimQuiz onSuccess={onSuccess} />
        </div>
      </section>
    </main>
  );
};

export default QuizStage;
