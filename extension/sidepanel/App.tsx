/**
 * Main App component
 * Manages view routing and global state
 */

import React, { useEffect, useState } from 'react';
import { useSprintStore } from './state/sprintStore';
import LessonPlan from './components/LessonPlan';
import SprintView from './components/SprintView';
import Toolbar from './components/Toolbar';
import type { PageExtraction } from '../extract/types';

type View = 'lesson' | 'sprint';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('lesson');
  const [showChunkManager, setShowChunkManager] = useState(false);
  const [allExtractions, setAllExtractions] = useState<Record<string, PageExtraction>>({});
  const { extraction, sprintStatus, loadProgress, setExtraction } = useSprintStore();

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

  // Load all extractions from storage on mount
  useEffect(() => {
    const loadAllExtractions = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('allExtractions');
        if (result.allExtractions) {
          setAllExtractions(result.allExtractions);
        }
      }
    };
    loadAllExtractions();
  }, []);

  // Save extraction to multi-page storage
  useEffect(() => {
    if (extraction) {
      setAllExtractions(prev => {
        const updated = { ...prev, [extraction.pageUrl]: extraction };
        // Save to Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ allExtractions: updated });
        }
        return updated;
      });
    }
  }, [extraction]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar 
        onShowChunkManager={() => setShowChunkManager(true)}
        extractionCount={Object.keys(allExtractions).length}
      />
      
      <main className="p-4">
        {showChunkManager ? (
          <ChunkManager 
            extractions={allExtractions}
            onSelectExtraction={(extraction) => {
              setExtraction(extraction);
              setShowChunkManager(false);
            }}
            onClose={() => setShowChunkManager(false)}
          />
        ) : !extraction ? (
          <WelcomeScreen 
            onShowChunkManager={() => setShowChunkManager(true)}
            allExtractions={allExtractions}
          />
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

interface WelcomeScreenProps {
  onShowChunkManager: () => void;
  allExtractions: Record<string, PageExtraction>;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onShowChunkManager, allExtractions }) => {
  const { setExtraction, setIsLoading, isLoading } = useSprintStore();

  const handleExtractContent = async () => {
    setIsLoading(true);

    try {
      const webUrl = /^https?:\/\//i;

      const pickWebTab = (tabs: chrome.tabs.Tab[] | undefined) =>
        tabs?.find(tab => tab.url && webUrl.test(tab.url || ''));

      // 1) Prefer the active tab in the current window (the visible doc next to the side panel)
      let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // 2) If that isn’t a web tab, try the last focused normal window (covers side panel focus cases)
      if (!activeTab || !activeTab.url || !webUrl.test(activeTab.url)) {
        const [focusedTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true, windowType: 'normal' });
        if (focusedTab && focusedTab.url && webUrl.test(focusedTab.url)) {
          activeTab = focusedTab;
        }
      }

      // 3) Consider other active tabs across normal windows
      if (!activeTab || !activeTab.url || !webUrl.test(activeTab.url)) {
        const activeNormals = await chrome.tabs.query({ active: true, windowType: 'normal' });
        const candidate = pickWebTab(activeNormals);
        if (candidate) {
          activeTab = candidate;
        }
      }

      // 4) Finally, scan all known http(s) tabs (requires "tabs" permission)
      if (!activeTab || !activeTab.url || !webUrl.test(activeTab.url)) {
        const webTabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
        const candidate = pickWebTab(webTabs);
        if (candidate) {
          activeTab = candidate;
        }
      }

      if (!activeTab?.id || !activeTab.url || !webUrl.test(activeTab.url)) {
        throw new Error('No active tab found');
      }

      // Check if we already have chunks for this page
      if (activeTab.url && allExtractions[activeTab.url]) {
        const confirmed = window.confirm(
          `You already have chunks from this page. Extract new content?\n\n` +
          `Old chunks will be archived and can be accessed via "View All Chunks".`
        );
        if (!confirmed) {
          setIsLoading(false);
          return;
        }
      }

      // Request content extraction from content script
      const response = await chrome.tabs.sendMessage(activeTab.id, { action: 'extractContent' }).catch(err => {
        return { success: false, error: (chrome.runtime.lastError && chrome.runtime.lastError.message) || String(err) } as any;
      });

      if (response.success) {
        setExtraction(response.data);
      } else {
        console.error('Extraction failed:', response.error);
        alert('Failed to extract content. Make sure:\n\n• You have a normal HTTP/HTTPS tab focused (not chrome://, extensions, or the side panel).\n• The page finished loading and allows scripts.');
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

      {/* View All Chunks button */}
      {Object.keys(allExtractions).length > 0 && (
        <button
          onClick={onShowChunkManager}
          className="mt-4 btn-secondary"
          aria-label="View all chunks"
        >
          📚 View All Chunks ({Object.keys(allExtractions).length})
        </button>
      )}
    </div>
  );
};

interface ChunkManagerProps {
  extractions: Record<string, PageExtraction>;
  onSelectExtraction: (extraction: PageExtraction) => void;
  onClose: () => void;
}

const ChunkManager: React.FC<ChunkManagerProps> = ({ extractions, onSelectExtraction, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleDelete = async (url: string) => {
    if (window.confirm('Are you sure you want to delete this page\'s chunks?')) {
      const updated = { ...extractions };
      delete updated[url];
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ allExtractions: updated });
      }
      
      // Force re-render - in real implementation, pass as prop or use state management
      window.location.reload();
    }
  };

  const filteredExtractions = Object.entries(extractions).filter(([url, extraction]) => {
    const query = searchQuery.toLowerCase();
    return extraction.pageTitle.toLowerCase().includes(query) ||
           url.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Chunks</h2>
        <button onClick={onClose} className="btn-secondary">
          ← Back
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Extraction list */}
      <div className="space-y-4">
        {filteredExtractions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No pages found.' : 'No chunks yet. Extract content from a page to get started.'}
            </p>
          </div>
        ) : (
          filteredExtractions.map(([url, extraction]) => (
            <div key={url} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{extraction.pageTitle}</h3>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline"
                  >
                    {url}
                  </a>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>{extraction.chunks.length} chunks</span>
                    {extraction.license && (
                      <span className="badge-secondary">
                        {extraction.license.kind}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectExtraction(extraction)}
                    className="btn-primary"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDelete(url)}
                    className="btn-secondary text-red-600 hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;

