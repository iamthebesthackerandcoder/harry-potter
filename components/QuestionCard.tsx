
import React from 'react';
import { QuestionWithOptions } from '../types';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionData: QuestionWithOptions;
  onAnswerSelect: (answer: string) => void;
  isSubmitting: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  totalQuestions,
  questionData,
  onAnswerSelect,
  isSubmitting
}) => {
  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto border-2 border-slate-700">
      <div className="mb-6 text-center">
        <p className="text-yellow-400 text-lg font-semibold">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mt-2 leading-tight">
          {questionData.question}
        </h2>
      </div>
      <div className="space-y-4">
        {questionData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(option)}
            disabled={isSubmitting}
            className={`w-full text-left p-4 rounded-lg transition-all duration-150 ease-in-out
                        font-body text-lg
                        ${isSubmitting 
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transform hover:scale-102'
                        }`}
          >
            {option}
          </button>
        ))}
      </div>
      {isSubmitting && <p className="text-center mt-6 text-yellow-300 font-body">Consulting the Sorting Hat...</p>}
    </div>
  );
};

export default QuestionCard;
