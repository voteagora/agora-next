import React from "react";
import { Button } from "../../../components/ui/button";

const ConstitutionStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
          congrats, you qualify
        </div>
      </section>
      <section className="col-span-3">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
          review
          <Button
            onClick={() => {
              onSuccess();
            }}
          >
            Next
          </Button>
        </div>
      </section>
    </main>
  );
};

export default ConstitutionStage;
