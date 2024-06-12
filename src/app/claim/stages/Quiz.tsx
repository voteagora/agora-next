import React from "react";
import ClaimQuiz from "../components/ClaimQuiz";

const QuizStage = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <main className="grid grid-cols-8 gap-10 mt-12">
      <section className="col-span-5">
        <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
          scrolls vision and values
        </div>
      </section>
      <section className="col-span-3">
        <ClaimQuiz onSuccess={onSuccess} />
      </section>
    </main>
  );
};

export default QuizStage;
