/**
 * Lesson Plan component
 * Displays the list of lesson chunks with progress
 */

import React from 'react';
import { useSprintStore } from '../state/sprintStore';
import { exportLessonPlanToMarkdown, downloadMarkdown } from '../lib/markdownExport';

interface LessonPlanProps {
  onStartSprint: () => void;
}

const LessonPlan: React.FC<LessonPlanProps> = ({ onStartSprint }) => {
  const { extraction, startSprint, getChunkProgress, progress } = useSprintStore();

  if (!extraction) {
    return null;
  }

  const handleStartChunk = (chunkId: string) => {
    const chunk = extraction.chunks.find((c) => c.id === chunkId);
    if (chunk) {
      startSprint(chunk);
      onStartSprint();
    }
  };

  const handleExportAll = () => {
    const pageProgress = progress[extraction.pageUrl];
    const progressMap = pageProgress?.chunks || {};
    
    const markdown = exportLessonPlanToMarkdown(extraction, progressMap);
    const filename = `${extraction.pageTitle.replace(/[^a-z0-9]/gi, '_')}_lesson_plan`;
    
    downloadMarkdown(markdown, filename);
  };

  const completedCount = extraction.chunks.filter(
    (chunk) => getChunkProgress(chunk.id)?.status === 'done'
  ).length;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{extraction.pageTitle}</h2>
        <a
          href={extraction.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline text-sm"
        >
          View original page ↗
        </a>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-gray-600">
            {completedCount} of {extraction.chunks.length} chunks completed
          </p>

          <button onClick={handleExportAll} className="btn-sm btn-secondary" aria-label="Export lesson plan">
            📥 Export All
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / extraction.chunks.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={extraction.chunks.length}
          />
        </div>
      </div>

      {/* Chunk list */}
      <div className="space-y-4">
        {extraction.chunks.map((chunk, index) => {
          const chunkProgress = getChunkProgress(chunk.id);
          const isDone = chunkProgress?.status === 'done';

          return (
            <div key={chunk.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-500">
                      Chunk {index + 1}
                    </span>
                    {isDone ? (
                      <span className="badge-done">
                        ✓ Done
                        {chunkProgress?.score &&
                          ` (${chunkProgress.score.correct}/${chunkProgress.score.total})`}
                      </span>
                    ) : (
                      <span className="badge-new">New</span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{chunk.title}</h3>

                  <p className="text-gray-600 text-sm mb-3">
                    {chunk.text.slice(0, 150)}
                    {chunk.text.length > 150 ? '...' : ''}
                  </p>

                  {chunk.codeBlocks.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>💻</span>
                      <span>
                        {chunk.codeBlocks.length} code{' '}
                        {chunk.codeBlocks.length === 1 ? 'block' : 'blocks'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => handleStartChunk(chunk.id)}
                    className="btn-primary whitespace-nowrap"
                    aria-label={`Start sprint for ${chunk.title}`}
                  >
                    {isDone ? 'Review' : 'Start Sprint'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LessonPlan;

