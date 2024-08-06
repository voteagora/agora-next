import React from "react";
import Image from "next/image";
import { Button } from "../../../components/ui/button";
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";

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
  const openDialog = useOpenDialog();

  const criteriaOnly = Object.keys(MOCK_ELIGIBILITY_CRITERIA).filter(
    (key) => key !== "total"
  );

  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-line p-6 shadow-newDefault">
          <h1 className="text-2xl font-black text-primary">
            {MOCK_ELIGIBILITY_CRITERIA.total > 0
              ? `Congratulations, you can claim ${MOCK_ELIGIBILITY_CRITERIA.total} SCROLL`
              : "No allocation found"}
          </h1>
          <div className="flex flex-row space-x-4 mt-4">
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
          <StatCard className="mt-4" />
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
              <div className="flex flex-row items-center py-4 border-b border-dotted last:border-solid border-line">
                <QuestionMarkCircleIcon className="h-5 w-5 text-secondary mr-2" />
                <span className="flex-1 mr-4 font-medium text-primary">
                  Community contributor
                </span>
                <span
                  className="text-brandPrimary font-medium cursor-pointer"
                  onClick={() => {
                    openDialog({
                      type: "CLAIM_FLOW_GITHUB_CHECK",
                      params: {},
                    });
                  }}
                >
                  Check eligibility
                </span>
              </div>
              <div className="flex flex-row items-center py-4 border-b border-dotted last:border-solid border-line">
                <QuestionMarkCircleIcon className="h-5 w-5 text-secondary mr-2" />
                <span className="flex-1 mr-4 font-medium text-primary">
                  Community developer
                </span>
                <span
                  className="text-brandPrimary font-medium cursor-pointer"
                  onClick={() => {
                    openDialog({
                      type: "CLAIM_FLOW_EMAIL_CHECK",
                      params: {},
                    });
                  }}
                >
                  Check eligibility
                </span>
              </div>
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
          {MOCK_ELIGIBILITY_CRITERIA.total > 0 && (
            <div className="bg-neutral rounded-2xl border border-line p-6 shadow-newDefault">
              <h1 className="text-2xl font-black text-primary">
                Your token claim
              </h1>
              <div className="w-full border border-line rounded-2xl mt-4 p-4">
                <span className="flex flex-row justify-between items-center border-b border-dotted border-line last:border-b-0">
                  <p className="font-medium text-5xl text-primary">
                    {MOCK_ELIGIBILITY_CRITERIA.total}
                  </p>
                  <span className="text-sm w-1/3 text-secondary text-right">
                    Scroll available to claim now
                  </span>
                </span>
                <span className="flex flex-row justify-between items-center">
                  <p className="font-medium text-5xl text-primary">
                    {MOCK_ELIGIBILITY_CRITERIA.total}
                  </p>
                  <span className="text-sm w-1/3 text-secondary text-right">
                    Sent to your wallet soon. Learn more
                  </span>
                </span>
              </div>
              <div className="mt-6">
                <Button
                  variant="brandPrimary"
                  className="w-full"
                  onClick={() => {
                    onSuccess();
                  }}
                >
                  Begin claim process
                </Button>
              </div>
            </div>
          )}
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
