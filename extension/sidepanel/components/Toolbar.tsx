/**
 * Toolbar component
 * Contains navigation and utility buttons
 */

import React from 'react';

interface ToolbarProps {
  onShowChunkManager?: () => void;
  extractionCount?: number;
}

const Toolbar: React.FC<ToolbarProps> = ({ onShowChunkManager, extractionCount = 0 }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg" aria-hidden="true">
              L
            </span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">LearnMyWay</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* View All Chunks button */}
          {onShowChunkManager && extractionCount > 0 && (
            <button
              onClick={onShowChunkManager}
              className="btn-sm btn-primary"
              title={`View all ${extractionCount} pages`}
              aria-label="View all chunks"
            >
              📚 Chunks ({extractionCount})
            </button>
          )}

          {/* P1 hooks - disabled in P0 */}
          <button
            className="btn-sm btn-secondary opacity-50 cursor-not-allowed"
            disabled
            title="Coming in P1: Adjust reading level"
            aria-label="Reading level selector (coming soon)"
          >
            📊 Level
          </button>

          <button
            className="btn-sm btn-secondary opacity-50 cursor-not-allowed"
            disabled
            title="Coming in P1: Bilingual toggle"
            aria-label="Language selector (coming soon)"
          >
            🌐 Lang
          </button>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;

