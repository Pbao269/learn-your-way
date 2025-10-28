/**
 * Sprint View component
 * Main view for an active learning sprint
 */

import React, { useState, useEffect } from 'react';
import { useSprintStore } from '../state/sprintStore';
import Timer from './Timer';
import ReadingMode from './ReadingMode';
import LogicalMode from './LogicalMode';
import { exportChunkToMarkdown, downloadMarkdown } from '../lib/markdownExport';
import { aiProvider } from '../../ai/provider';

interface SprintViewProps {
  onEndSprint: () => void;
}

const SprintView: React.FC<SprintViewProps> = ({ onEndSprint }) => {
  const {
    currentChunk,
    extraction,
    sprintStatus,
    notes,
    setNotes,
    resetSprint,
    getChunkProgress,
    quizResults,
  } = useSprintStore();

  const [objectives, setObjectives] = useState<string[]>([]);
  const [explainer, setExplainer] = useState<string>('');

  useEffect(() => {
    // Load objectives and explainer for export
    const loadContent = async () => {
      if (currentChunk) {
        try {
          const [objResult, expResult] = await Promise.all([
            aiProvider.objectives({ text: currentChunk.text }),
            aiProvider.summarizeSection({ text: currentChunk.text, goal: 'explain' }),
          ]);
          setObjectives(objResult);
          setExplainer(expResult.summary);
        } catch (error) {
          console.error('Failed to load sprint content:', error);
        }
      }
    };

    loadContent();
  }, [currentChunk]);

  if (!currentChunk || !extraction) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">No chunk selected for sprint.</p>
      </div>
    );
  }

  const handleEndSprint = () => {
    resetSprint();
    onEndSprint();
  };

  const handleExport = async () => {
    try {
      // Get quiz data
      const quiz = await aiProvider.quiz({ text: currentChunk.text });
      const progress = getChunkProgress(currentChunk.id);

      const markdown = exportChunkToMarkdown({
        extraction,
        chunk: currentChunk,
        objectives,
        explainer,
        quiz,
        notes,
        progress,
      });

      const filename = `${currentChunk.title.replace(/[^a-z0-9]/gi, '_')}_sprint`;
      downloadMarkdown(markdown, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    }
  };

  const isCompleted = sprintStatus === 'completed';
  const chunkProgress = getChunkProgress(currentChunk.id);

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleEndSprint}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              aria-label="Back to lesson plan"
            >
              ← Back
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{currentChunk.title}</h2>
          <a
            href={currentChunk.anchors.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline text-sm"
          >
            View source ↗
          </a>
        </div>

        <button onClick={handleExport} className="btn-sm btn-secondary" aria-label="Export sprint">
          📥 Export
        </button>
      </div>

      {/* Timer */}
      {!isCompleted && (
        <div className="mb-6">
          <Timer />
        </div>
      )}

      {/* Completion message */}
      {isCompleted && (
        <div className="mb-6 card bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-lg font-semibold text-green-900 mb-1">Sprint Completed!</p>
            <p className="text-sm text-green-700">
              Score: {(quizResults.mcqCorrect ? 1 : 0) + (quizResults.fillCorrect ? 1 : 0)}/2
            </p>
          </div>
        </div>
      )}

      {/* Reading Mode */}
      <div className="mb-6">
        <ReadingMode text={currentChunk.text} />
      </div>

      {/* Logical Mode */}
      <div className="mb-6">
        <LogicalMode text={currentChunk.text} />
      </div>

      {/* Code Blocks (if any) */}
      {currentChunk.codeBlocks.length > 0 && (
        <div className="mb-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Code Examples</h3>
            <div className="space-y-4">
              {currentChunk.codeBlocks.map((block, index) => (
                <div key={index}>
                  {block.lang && (
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Language: {block.lang}
                    </p>
                  )}
                  <pre className="code-block">
                    <code>{block.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl" aria-hidden="true">
              📝
            </span>
            <h3 className="text-lg font-semibold text-gray-900">My Notes</h3>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes here..."
            className="textarea"
            rows={6}
            aria-label="Sprint notes"
          />

          <p className="mt-2 text-xs text-gray-500">
            Notes are automatically saved with your progress.
          </p>
        </div>
      </div>

      {/* Previous Progress (if reviewing) */}
      {chunkProgress?.status === 'done' && (
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-1">Previous Attempt:</p>
          <p className="text-sm text-blue-800">
            Score: {chunkProgress.score?.correct}/{chunkProgress.score?.total}
          </p>
        </div>
      )}
    </div>
  );
};

export default SprintView;

