
import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = "An Error Occurred", message, onRetry }) => {
  return (
    <div className="bg-red-800 border-2 border-red-600 text-red-100 p-6 rounded-lg shadow-xl max-w-md mx-auto text-center">
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-lg mb-4 font-body">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-2 px-6 rounded-md transition-colors duration-150 shadow-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
