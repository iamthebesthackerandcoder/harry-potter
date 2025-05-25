
import React from 'react';

interface WelcomeScreenProps {
  onStartQuiz: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartQuiz }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[calc(100vh-100px)]">
      <img src="https://picsum.photos/seed/hogwarts/200/200" alt="Hogwarts Crest" className="w-32 h-32 md:w-48 md:h-48 rounded-full mb-8 shadow-lg border-4 border-yellow-400"/>
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-4">The Sorting Hat Awaits!</h1>
      <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl font-body">
        Welcome, young witch or wizard! The time has come to discover your true Hogwarts house. Answer honestly, for the Hat sees all. Your choices will shape your destiny.
      </p>
      <button
        onClick={onStartQuiz}
        className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-yellow-400/50"
      >
        Begin the Sorting
      </button>
       <p className="mt-12 text-sm text-slate-500 font-body">
        Powered by Gemini AI for a uniquely adaptive experience.
      </p>
    </div>
  );
};

export default WelcomeScreen;
