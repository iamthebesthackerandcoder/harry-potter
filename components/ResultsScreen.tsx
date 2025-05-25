
import React from 'react';
import { HogwartsHouse } from '../types';
import { HOUSE_THEMES } from '../constants';
import HouseBadge from './HouseBadge';

interface ResultsScreenProps {
  house: HogwartsHouse;
  characterProfile: string;
  onRestartQuiz: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ house, characterProfile, onRestartQuiz }) => {
  const theme = HOUSE_THEMES[house];

  return (
    <div className="flex flex-col items-center p-4 md:p-8 space-y-8 max-w-3xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-2 text-center">The Sorting Hat Has Spoken!</h2>
      
      <HouseBadge house={house} showDescription={true} />

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full border-2 border-slate-700">
        <h3 className={`text-2xl font-semibold mb-3 ${theme.textColor}`}>Your Character Archetype</h3>
        <p className="text-slate-200 leading-relaxed whitespace-pre-line font-body text-lg">
          {characterProfile || "No profile generated."}
        </p>
      </div>

      <button
        onClick={onRestartQuiz}
        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-yellow-400/50"
      >
        Take the Quiz Again
      </button>
    </div>
  );
};

export default ResultsScreen;
