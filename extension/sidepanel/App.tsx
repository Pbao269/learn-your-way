/**
 * Main App component
 * Manages view routing and global state
 */

import React, { useEffect, useState } from 'react';
import { useSprintStore } from './state/sprintStore';
import LessonPlan from './components/LessonPlan';
import SprintView from './components/SprintView';
import Toolbar from './components/Toolbar';

type View = 'lesson' | 'sprint';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('lesson');
  const { extraction, sprintStatus, loadProgress } = useSprintStore();

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Handle view changes based on sprint status
  useEffect(() => {
    if (sprintStatus === 'running' || sprintStatus === 'paused') {
      setCurrentView('sprint');
    } else if (sprintStatus === 'idle') {
      setCurrentView('lesson');
    }
  }, [sprintStatus]);

  const handleStartSprint = () => {
    setCurrentView('sprint');
  };

  const handleEndSprint = () => {
    setCurrentView('lesson');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar />
      
      <main className="p-4">
        {!extraction ? (
          <WelcomeScreen />
        ) : currentView === 'lesson' ? (
          <LessonPlan onStartSprint={handleStartSprint} />
        ) : (
          <SprintView onEndSprint={handleEndSprint} />
        )}
      </main>

      {/* Privacy Banner */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="privacy-banner">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            <strong>Privacy:</strong> All processing happens on-device. No data sent to external
            servers in P0.
          </span>
        </div>
      </footer>
    </div>
  );
};

const WelcomeScreen: React.FC = () => {
  const { setExtraction, setIsLoading, isLoading } = useSprintStore();

  const handleExtractContent = async () => {
    setIsLoading(true);

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error('No active tab found');
      }

      // Request content extraction from content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });

      if (response.success) {
        setExtraction(response.data);
      } else {
        console.error('Extraction failed:', response.error);
        alert('Failed to extract content. Please try again on a documentation page.');
      }
    } catch (error) {
      console.error('Failed to extract content:', error);
      alert('Failed to extract content. Make sure you are on a valid web page.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LearnMyWay</h1>
        <p className="text-gray-600 max-w-md">
          Turn long documentation pages into micro-lessons delivered in 10-minute focus sprints.
        </p>
      </div>

      <button
        onClick={handleExtractContent}
        disabled={isLoading}
        className="btn-primary"
        aria-label="Extract content from current page"
      >
        {isLoading ? 'Extracting...' : 'Extract Content from This Page'}
      </button>

      <div className="mt-8 text-sm text-gray-500">
        <p>📚 Navigate to any documentation page and click the button above.</p>
      </div>
    </div>
  );
};

export default App;

