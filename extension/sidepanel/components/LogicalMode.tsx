/**
 * Logical Mode component
 * Displays objectives and quick check questions
 */

import React, { useEffect, useState } from 'react';
import { aiProvider } from '../../ai/provider';
import QuizCard from './QuizCard';

interface LogicalModeProps {
  text: string;
}

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

const LogicalMode: React.FC<LogicalModeProps> = ({ text }) => {
  const [objectives, setObjectives] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Generate objectives and quiz in parallel
        const [objectivesResult, quizResult] = await Promise.all([
          aiProvider.objectives({ text }),
          aiProvider.quiz({ text }),
        ]);

        setObjectives(objectivesResult);
        setQuiz(quizResult);
      } catch (err) {
        console.error('Failed to generate logical content:', err);
        setError('Failed to generate quiz. Please try again.');
        
        // Fallback objectives
        setObjectives([
          'Understand the main concepts',
          'Apply the knowledge in practice',
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [text]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-gray-500">
              <p>Generating objectives and quiz...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Objectives */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl" aria-hidden="true">
            🎯
          </span>
          <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
        </div>

        <ul className="space-y-2">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-primary-600 font-semibold mt-1">•</span>
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz */}
      {error && (
        <div className="card">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {error}
          </div>
        </div>
      )}

      {quiz && <QuizCard quiz={quiz} />}

      {/* P1 hook: Visual Mode */}
      <div className="card opacity-50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl" aria-hidden="true">
            📊
          </span>
          <h3 className="text-lg font-semibold text-gray-500">Visual Mode (P1)</h3>
        </div>
        <p className="text-sm text-gray-500">
          Coming in P1: Deterministic SVG diagrams (flowcharts, concept maps, comparisons)
        </p>
      </div>
    </div>
  );
};

export default LogicalMode;

