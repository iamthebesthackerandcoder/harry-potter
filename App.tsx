
import React, { useState, useEffect, useCallback } from 'react';
import { QuizState, Answer, HogwartsHouse, QuestionWithOptions } from './types';
import { TOTAL_QUESTIONS } from './constants';
import * as geminiService from './services/geminiService';

import WelcomeScreen from './components/WelcomeScreen';
import QuestionCard from './components/QuestionCard';
import ResultsScreen from './components/ResultsScreen';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [quizState, setQuizState] = useState<QuizState>(QuizState.NOT_STARTED);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0); // Represents the number of the question being shown or loaded
  const [currentQuestionData, setCurrentQuestionData] = useState<QuestionWithOptions | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [determinedHouse, setDeterminedHouse] = useState<HogwartsHouse | null>(null);
  const [characterProfile, setCharacterProfile] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  // Fix: Add isSubmittingAnswer state to manage QuestionCard's submitting state
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);

  useEffect(() => {
    const apiKeyPresent = geminiService.initializeGoogleAI();
    if (!apiKeyPresent) {
      setQuizState(QuizState.API_KEY_MISSING);
      setErrorMessage("Gemini API Key is missing. Please ensure it's set in your environment variables.");
    }
  }, []);

  // Fix: Create a dedicated function to load questions
  const loadQuestion = useCallback(async (questionNum: number, currentAnswers: Answer[]) => {
    if (quizState === QuizState.API_KEY_MISSING) return;
    setLoadingMessage(`Summoning question ${questionNum}...`);
    setQuizState(QuizState.LOADING_QUESTION);
    setErrorMessage('');
    try {
      const questionData = await geminiService.generateQuestion(currentAnswers, questionNum);
      if (questionData && questionData.question && questionData.options && questionData.options.length > 0) {
        setCurrentQuestionData(questionData);
        setCurrentQuestionNumber(questionNum);
        setQuizState(QuizState.SHOWING_QUESTION);
      } else {
        throw new Error("Failed to get a valid question from the Sorting Hat. The response was incomplete or malformed.");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred while fetching the question. The Sorting Hat might be resting.");
      setQuizState(QuizState.ERROR);
    }
  }, [quizState]); // quizState dependency for API_KEY_MISSING check

  const handleStartQuiz = useCallback(() => {
    if (quizState === QuizState.API_KEY_MISSING) return;
    setAnswers([]);
    setCurrentQuestionData(null);
    setDeterminedHouse(null);
    setCharacterProfile('');
    setErrorMessage('');
    setIsSubmittingAnswer(false);
    // Load the first question (question number 1) with an empty answers array
    loadQuestion(1, []);
  }, [loadQuestion, quizState]);


  const handleAnswerSubmit = async (selectedAnswer: string) => {
    if (!currentQuestionData) return;
    
    setIsSubmittingAnswer(true); // Indicate submission process has started for UI feedback on QuestionCard

    const newAnswers = [...answers, { question: currentQuestionData.question, answer: selectedAnswer }];
    setAnswers(newAnswers);

    if (newAnswers.length < TOTAL_QUESTIONS) {
      // Load next question. Question number is newAnswers.length + 1
      await loadQuestion(newAnswers.length + 1, newAnswers);
    } else {
      // Quiz finished, determine house and profile
      setQuizState(QuizState.LOADING_RESULTS);
      setLoadingMessage("The Sorting Hat is making its decision...");
      try {
        const houseResult = await geminiService.determineHouse(newAnswers);
        if (houseResult && houseResult.house) {
          setDeterminedHouse(houseResult.house);
          setLoadingMessage(`You belong in ${houseResult.house}! Crafting your persona...`);
          
          const profileResult = await geminiService.generateCharacterProfile(newAnswers, houseResult.house);
          if (profileResult && profileResult.profile) {
            setCharacterProfile(profileResult.profile);
            setQuizState(QuizState.SHOWING_RESULTS);
          } else {
            throw new Error("Failed to generate your character profile. The Hat is puzzled.");
          }
        } else {
          throw new Error("The Sorting Hat couldn't decide on a house. Perhaps try again?");
        }
      } catch (error) {
        console.error("Error during quiz completion:", error);
        setErrorMessage(error instanceof Error ? error.message : "An error occurred while finalizing your sorting.");
        setQuizState(QuizState.ERROR);
      }
    }
    setIsSubmittingAnswer(false); // Reset submission state after operation completes
  };
  
  const handleRetry = () => {
    if (quizState === QuizState.API_KEY_MISSING) return;
    setErrorMessage('');
    setIsSubmittingAnswer(false);

    if (answers.length < TOTAL_QUESTIONS && !determinedHouse) {
        // Retry loading the current/next question.
        // (answers.length) is the count of successfully answered questions.
        // So, the next question to load is (answers.length + 1).
        loadQuestion(answers.length + 1, answers);
    } else {
        // General error, or error after all questions answered (e.g., during results processing)
        handleStartQuiz(); // Default to full restart
    }
  };


  const renderContent = () => {
    switch (quizState) {
      case QuizState.API_KEY_MISSING:
        return <ErrorMessage title="API Key Missing" message={errorMessage} />;
      case QuizState.NOT_STARTED:
        return <WelcomeScreen onStartQuiz={handleStartQuiz} />;
      case QuizState.LOADING_QUESTION:
      case QuizState.LOADING_RESULTS:
        return <LoadingSpinner message={loadingMessage} />;
      case QuizState.SHOWING_QUESTION:
        if (currentQuestionData) {
          return (
            <QuestionCard
              questionNumber={currentQuestionNumber}
              totalQuestions={TOTAL_QUESTIONS}
              questionData={currentQuestionData}
              onAnswerSelect={handleAnswerSubmit}
              // Fix: Use isSubmittingAnswer state for the isSubmitting prop
              isSubmitting={isSubmittingAnswer}
            />
          );
        }
        return <LoadingSpinner message="Preparing the next parchment..." />; // Fallback if data not ready
      case QuizState.SHOWING_RESULTS:
        if (determinedHouse && characterProfile) {
          return (
            <ResultsScreen
              house={determinedHouse}
              characterProfile={characterProfile}
              onRestartQuiz={handleStartQuiz}
            />
          );
        }
        // If profile is missing but house is determined, it could be an error in profile generation
        if (determinedHouse && !characterProfile) {
             return <ErrorMessage title="Sorting Partially Complete" message="We found your house, but couldn't generate your character profile. Try starting over?" onRetry={handleStartQuiz} />;
        }
        return <ErrorMessage title="Sorting Incomplete" message="Something went wrong displaying your results." onRetry={handleStartQuiz} />;
      case QuizState.ERROR:
        return <ErrorMessage message={errorMessage || "An unexpected enchantment went awry!"} onRetry={handleRetry} />;
      default:
        return <WelcomeScreen onStartQuiz={handleStartQuiz} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex flex-col items-center justify-center p-4 selection:bg-yellow-500 selection:text-black">
      <main className="container mx-auto w-full">
        {renderContent()}
      </main>
       <footer className="text-center py-6 text-sm text-slate-400 font-body">
        <p>&copy; {new Date().getFullYear()} Hogwarts Digital Sorting. Not affiliated with Warner Bros. or J.K. Rowling.</p>
      </footer>
    </div>
  );
};

export default App;