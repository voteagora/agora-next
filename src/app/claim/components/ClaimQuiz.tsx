import React, { useState } from "react";

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
    <div className="bg-white rounded-2xl border border-agora-stone-100 p-4">
      <span className="text-xs text-agora-stone-700 font-semibold">
        QUESTION {currentQuestionIndex + 1} of {TEMP_QUIZ_QUESTIONS.length}
      </span>
      <h1 className="font-black text-2xl">{currentQuestion.question}</h1>
      <ul className="mt-10">
        {currentQuestion.answers.map((answer, idx) => (
          <li
            key={`answer-${idx}`}
            className={`border ${currentAnswer === "" || answer !== currentAnswer ? "border-agora-stone-100" : isCorrectAnswer ? "border-green-500" : "border-red-500"} rounded-full p-2 mt-2 text-center font-semibold text-agora-stone-900`}
            onClick={() => validateAnswer(answer)}
          >
            {answer}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <button
          className={`${canProceed ? "bg-agora-stone-900" : "bg-agora-stone-500"} text-white font-semibold w-full p-2 rounded-2xl`}
          onClick={canProceed ? next : () => {}}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClaimQuiz;
