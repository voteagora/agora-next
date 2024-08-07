import React, { useState } from "react";
import { Button } from "../../../components/ui/button";

// These are fake quiz questions for the sake of the example
// We can sub them out with the real scroll quiz questions once we have them
const TEMP_QUIZ_QUESTIONS = [
  {
    question: "What is the capital of France?",
    answers: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    question: "What is the capital of Germany?",
    answers: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Berlin",
  },
  {
    question: "What is the capital of Spain?",
    answers: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Madrid",
  },
];

const ClaimQuiz = ({ onSuccess }: { onSuccess: () => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [canProceed, setCanProceed] = useState(false);

  const currentQuestion = TEMP_QUIZ_QUESTIONS[currentQuestionIndex];
  const isCorrectAnswer = currentAnswer === currentQuestion.correctAnswer;

  const validateAnswer = (answer: string) => {
    setCurrentAnswer(answer);
    setCanProceed(answer === currentQuestion.correctAnswer);
  };

  const next = () => {
    reset();
    if (currentQuestionIndex === TEMP_QUIZ_QUESTIONS.length - 1) {
      onSuccess();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const reset = () => {
    setCurrentAnswer("");
    setCanProceed(false);
  };

  return (
    <div className="bg-neutral rounded-2xl border border-line p-6">
      <span className="text-xs text-secondary font-semibold">
        QUESTION {currentQuestionIndex + 1} of {TEMP_QUIZ_QUESTIONS.length}
      </span>
      <h1 className="text-primary font-black text-2xl">
        {currentQuestion.question}
      </h1>
      <ul className="mt-10">
        {currentQuestion.answers.map((answer, idx) => (
          <li
            key={`answer-${idx}`}
            className={`border ${currentAnswer === "" || answer !== currentAnswer ? "border-line" : isCorrectAnswer ? "border-green-500 bg-green-100 text-green-600" : "border-red-500 bg-red-100 text-red-600"} rounded-xl p-3 mt-2 text-center font-semibold text-primary flex fle-row justify-between`}
            onClick={() => validateAnswer(answer)}
          >
            <span>{answer}</span>
            {answer === currentAnswer && (
              <span
                className={
                  isCorrectAnswer
                    ? "border-green-500 bg-green-100 text-green-600"
                    : "border-red-500 bg-red-100 text-red-600"
                }
              >
                {canProceed ? "Correct" : "Incorrect"}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Button
          variant="brandPrimary"
          className="w-full"
          onClick={canProceed ? next : () => {}}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ClaimQuiz;
