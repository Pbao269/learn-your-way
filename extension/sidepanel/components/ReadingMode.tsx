/**
 * Reading Mode component
 * Displays concise explainer (120-180 words)
 */

import React, { useEffect, useState } from 'react';
import { aiProvider } from '../../ai/provider';

interface ReadingModeProps {
  text: string;
}

const ReadingMode: React.FC<ReadingModeProps> = ({ text }) => {
  const [explainer, setExplainer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateExplainer = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await aiProvider.summarizeSection({
          text,
          goal: 'explain',
        });

        const polished = await aiProvider.polish({ text: result.summary });
        setExplainer(polished);
      } catch (err) {
        console.error('Failed to generate explainer:', err);
        setError('Failed to generate explanation. Please try again.');
        // Fallback: show truncated text
        setExplainer(text.split(/\s+/).slice(0, 150).join(' ') + '...');
      } finally {
        setIsLoading(false);
      }
    };

    generateExplainer();
  }, [text]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-500">
            <p>Generating concise explanation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden="true">
          📖
        </span>
        <h3 className="text-lg font-semibold text-gray-900">Reading Mode</h3>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {error}
        </div>
      )}

      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {explainer.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-3">
            {paragraph}
          </p>
        ))}
      </div>

      {/* P1 hook: Code Explain button */}
      {/* This would be enabled when chunk.codeBlocks.length > 0 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          className="btn-sm btn-secondary opacity-50 cursor-not-allowed"
          disabled
          title="Coming in P1: Explain code blocks"
        >
          💻 Explain Code (P1)
        </button>
      </div>
    </div>
  );
};

export default ReadingMode;

