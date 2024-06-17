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
    <div className="bg-white rounded-2xl border border-agora-theme-100 p-6">
      <span className="text-xs text-agora-theme-700 font-semibold">
        QUESTION {currentQuestionIndex + 1} of {TEMP_QUIZ_QUESTIONS.length}
      </span>
      <h1 className="font-black text-2xl">{currentQuestion.question}</h1>
      <ul className="mt-10">
        {currentQuestion.answers.map((answer, idx) => (
          <li
            key={`answer-${idx}`}
            className={`border ${currentAnswer === "" || answer !== currentAnswer ? "border-agora-theme-100" : isCorrectAnswer ? "border-green-500 bg-green-100 text-green-600" : "border-red-500 bg-red-100 text-red-600"} rounded-full p-3 mt-2 text-center font-semibold text-agora-theme-900`}
            onClick={() => validateAnswer(answer)}
          >
            {answer}
          </li>
        ))}
      </ul>
      {currentAnswer !== "" && (
        <p className="text-center font-medium text-agora-theme-700 mt-10">
          {canProceed
            ? "That's correct!"
            : "Incorrect answer, please try again."}
        </p>
      )}
      <div className="mt-10">
        <button
          className={`${canProceed ? "bg-agora-theme-900 text-white" : " bg-agora-theme-100 text-agora-theme-700"} font-semibold w-full py-3 rounded-lg`}
          onClick={canProceed ? next : () => {}}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ClaimQuiz;
