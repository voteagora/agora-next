import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ConstitutionStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-6">
          <div className="bg-[url('/images/scroll/scroll-constitution.png')] bg-contain w-full h-44 rounded-lg"></div>
          <h1 className="font-black text-2xl mt-6">Working Constitution</h1>
          <p className="mt-6 text-agora-stone-700">
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
                <p className="text-agora-stone-700">
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
                <p className="text-agora-stone-700">
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
                <p className="text-agora-stone-700">
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
          <div className="bg-white rounded-2xl border border-agora-stone-100">
            <div className="p-6 border-b">
              <h1 className="font-black text-2xl">Review the Constitution</h1>
              <p className="mt-2 text-agora-stone-700">
                All community members should review the Constitution.
              </p>
            </div>
            <div className="p-6">
              <div className="flex flex-row space-x-2 items-center">
                <input
                  type="checkbox"
                  className="rounded border-agora-stone-100 text-agora-stone-900"
                />
                <label>I have read the Constitution</label>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => {
                  onSuccess();
                }}
              >
                Next
              </Button>
            </div>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            <AccordionItem value="item-1">
              <AccordionTrigger>FAQ</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>FAQ</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>FAQ</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </main>
  );
};

export default ConstitutionStage;
