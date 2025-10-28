/**
 * Quiz Card component
 * Handles multiple choice and fill-in-the-blank questions
 */

import React, { useState } from 'react';
import { useSprintStore } from '../state/sprintStore';

interface Quiz {
  mcq: {
    q: string;
    options: string[];
    correct: number;
    why: string;
  };
  fill: {
    q: string;
    a: string;
  };
}

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const { quizAnswers, quizResults, setQuizAnswer, checkQuizAnswers } = useSprintStore();
  const [showResults, setShowResults] = useState(false);
  const [fillInput, setFillInput] = useState('');

  const handleMCQSelect = (optionIndex: number) => {
    if (!showResults) {
      setQuizAnswer('mcq', optionIndex);
    }
  };

  const handleFillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFillInput(value);
    setQuizAnswer('fill', value);
  };

  const handleCheckAnswers = () => {
    checkQuizAnswers(quiz.mcq.correct, quiz.fill.a);
    setShowResults(true);
  };

  const handleReset = () => {
    setShowResults(false);
    setFillInput('');
  };

  const canCheck = quizAnswers.mcq !== undefined && quizAnswers.fill !== undefined;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl" aria-hidden="true">
          ❓
        </span>
        <h3 className="text-lg font-semibold text-gray-900">Quick Check</h3>
      </div>

      {/* Multiple Choice Question */}
      <div className="mb-6">
        <p className="font-medium text-gray-900 mb-3">1. {quiz.mcq.q}</p>

        <div className="space-y-2">
          {quiz.mcq.options.map((option, index) => {
            const isSelected = quizAnswers.mcq === index;
            const isCorrect = index === quiz.mcq.correct;
            
            let optionClass = 'quiz-option';
            if (showResults) {
              if (isCorrect) {
                optionClass = 'quiz-option-correct';
              } else if (isSelected && !isCorrect) {
                optionClass = 'quiz-option-incorrect';
              }
            } else if (isSelected) {
              optionClass = 'quiz-option-selected';
            }

            return (
              <button
                key={index}
                onClick={() => handleMCQSelect(index)}
                className={optionClass}
                disabled={showResults}
                aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                {showResults && isCorrect && <span className="ml-2">✓</span>}
                {showResults && isSelected && !isCorrect && <span className="ml-2">✗</span>}
              </button>
            );
          })}
        </div>

        {showResults && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
            <p className="text-sm text-blue-800">{quiz.mcq.why}</p>
          </div>
        )}
      </div>

      {/* Fill in the Blank */}
      <div className="mb-6">
        <p className="font-medium text-gray-900 mb-3">2. {quiz.fill.q}</p>

        <input
          type="text"
          value={fillInput}
          onChange={handleFillChange}
          disabled={showResults}
          placeholder="Type your answer..."
          className="input"
          aria-label="Fill in the blank answer"
        />

        {showResults && (
          <div className={`mt-3 p-3 rounded-lg border ${
            quizResults.fillCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              quizResults.fillCorrect ? 'text-green-900' : 'text-red-900'
            }`}>
              {quizResults.fillCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {!quizResults.fillCorrect && (
              <p className="text-sm text-red-800 mt-1">
                Correct answer: <strong>{quiz.fill.a}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!showResults ? (
          <button
            onClick={handleCheckAnswers}
            disabled={!canCheck}
            className={canCheck ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}
            aria-label="Check answers"
          >
            Check Answers
          </button>
        ) : (
          <>
            <button onClick={handleReset} className="btn-secondary" aria-label="Try again">
              Try Again
            </button>
            <div className="flex-1 flex items-center justify-end text-sm">
              <span className={quizResults.mcqCorrect && quizResults.fillCorrect
                ? 'text-green-600 font-medium'
                : 'text-gray-600'
              }>
                Score: {(quizResults.mcqCorrect ? 1 : 0) + (quizResults.fillCorrect ? 1 : 0)}/2
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizCard;

