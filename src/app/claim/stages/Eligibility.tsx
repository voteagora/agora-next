import React from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MOCK_ELIGIBILITY_CRITERIA = {
  "Bridged to Scroll": 100,
  "Provided liquidity on DEX": 200,
  "Multi-sig signer": 300,
  "Eligibility requirement": 0,
  total: 600,
};

const StatCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={`border border-line bg-neutral rounded-2xl flex flex-row ${className}`}
    >
      <span className="flex flex-1 flex-col items-center py-6 border-r border-line last:border-0">
        <p className="text-xs text-secondary font-medium">Total supply</p>
        <p className="font-semibold text-primary">2,000,000</p>
      </span>
      <span className="flex flex-1 flex-col items-center py-6 border-r border-line last:border-0">
        <p className="text-xs text-secondary font-medium">Eligible addresses</p>
        <p className="font-semibold text-primary">133,543</p>
      </span>
      <span className="flex flex-1 flex-col items-center py-6 border-r border-line last:border-0">
        <p className="text-xs text-secondary font-medium">Average allocation</p>
        <p className="font-semibold text-primary">493.24</p>
      </span>
    </div>
  );
};

const EligibilityCriteriaItem = ({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) => {
  return (
    <div className="flex flex-row items-center py-4 border-b border-dotted last:border-solid border-line">
      {amount > 0 ? (
        <CheckCircleIcon className="h-5 w-5 text-positive mr-2" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-negative mr-2" />
      )}
      <span className="flex-1 mr-4 font-medium text-primary">{title}</span>
      <span className="text-right font-medium text-primary">{amount}</span>
    </div>
  );
};
const EligibilityStage = ({ onSuccess }: { onSuccess: () => void }) => {
  const criteriaOnly = Object.keys(MOCK_ELIGIBILITY_CRITERIA).filter(
    (key) => key !== "total"
  );

  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-line p-6">
          <h1 className="text-2xl font-black text-primary">
            {MOCK_ELIGIBILITY_CRITERIA.total > 0
              ? "Congratulations, you qualify for the airdrop"
              : "You do not quality for the airdrop"}
          </h1>
          <div className="flex flex-row space-x-4 mt-10">
            {/* TODO (mg) edit copy */}
            <p className="text-secondary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              eu lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Aliquam eu lectus dignissim, porta
              tortor nec.
            </p>
            <Image
              src="/images/scroll/scroll-eligibility.png"
              width={200}
              height={200}
              alt="People float in a field of colored cubes"
            />
          </div>
          <StatCard className="mt-10" />
          <div className="mt-10">
            <div className="flex flex-row justify-between items-center">
              <h3 className="font-semibold text-primary">
                Eligiblity criteria
              </h3>
              <span className="font-semibold text-sm text-secondary">
                Learn more
              </span>
            </div>
            <div>
              {criteriaOnly.map((key) => (
                <EligibilityCriteriaItem
                  key={key}
                  title={key}
                  amount={
                    MOCK_ELIGIBILITY_CRITERIA[
                      key as keyof typeof MOCK_ELIGIBILITY_CRITERIA
                    ]
                  }
                />
              ))}
              <div className="flex flex-row items-center justify-between pt-4">
                <span className="font-medium text-primary">Total</span>
                <span className="font-medium text-primary">
                  {MOCK_ELIGIBILITY_CRITERIA.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="col-span-3">
        <div className="sticky top-4">
          <div className="bg-neutral rounded-2xl border border-line p-6">
            <h1 className="text-2xl font-black text-primary">
              Your allocation
            </h1>
            <p className="text-secondary mb-4">
              You are eligible for the airdrop
            </p>
            <div className="h-48 w-full border border-dotted border-line rounded-2xl bg-[url('/images/receipt_bg.svg')] bg-center relative flex items-center justify-center">
              <p className="font-semibold text-5xl text-primary">
                {MOCK_ELIGIBILITY_CRITERIA.total}
              </p>
            </div>
            <div className="mt-10">
              <Button
                className="w-full"
                onClick={() => {
                  onSuccess();
                }}
              >
                Begin claim process
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

export default EligibilityStage;
