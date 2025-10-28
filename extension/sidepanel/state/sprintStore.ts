/**
 * Sprint state management with Zustand
 * Handles sprint progress, scores, and local persistence
 */

import { create } from 'zustand';
import type { PageExtraction, LessonChunk } from '../../extract/types';

export type SprintStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface ChunkScore {
  correct: number;
  total: number;
}

export interface ChunkProgress {
  status: 'new' | 'done';
  score?: ChunkScore;
  notes?: string;
}

export interface PageProgress {
  updatedAt: number;
  chunks: Record<string, ChunkProgress>;
  prefs?: {
    level: 'beginner' | 'advanced';
    language?: string;
  };
}

export interface ProgressIndex {
  [pageUrl: string]: PageProgress;
}

export interface SprintState {
  // Current page extraction
  extraction: PageExtraction | null;
  setExtraction: (extraction: PageExtraction) => void;

  // Current sprint
  currentChunk: LessonChunk | null;
  sprintStatus: SprintStatus;
  sprintTimeRemaining: number; // in seconds
  startSprint: (chunk: LessonChunk) => void;
  pauseSprint: () => void;
  resumeSprint: () => void;
  completeSprint: () => void;
  resetSprint: () => void;
  setTimeRemaining: (seconds: number) => void;

  // Quiz state
  quizAnswers: {
    mcq?: number;
    fill?: string;
  };
  quizResults: {
    mcqCorrect?: boolean;
    fillCorrect?: boolean;
  };
  setQuizAnswer: (type: 'mcq' | 'fill', answer: number | string) => void;
  checkQuizAnswers: (
    correctMcq: number,
    correctFill: string
  ) => { mcqCorrect: boolean; fillCorrect: boolean };

  // Notes
  notes: string;
  setNotes: (notes: string) => void;

  // Progress tracking
  progress: ProgressIndex;
  loadProgress: () => Promise<void>;
  saveProgress: (chunkId: string, chunkProgress: Partial<ChunkProgress>) => Promise<void>;
  getChunkProgress: (chunkId: string) => ChunkProgress | undefined;

  // Preferences
  prefs: {
    level: 'beginner' | 'advanced';
    language?: string;
  };
  setPrefs: (prefs: Partial<SprintState['prefs']>) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useSprintStore = create<SprintState>((set, get) => ({
  // Initial state
  extraction: null,
  currentChunk: null,
  sprintStatus: 'idle',
  sprintTimeRemaining: 600, // 10 minutes
  quizAnswers: {},
  quizResults: {},
  notes: '',
  progress: {},
  prefs: {
    level: 'beginner',
  },
  isLoading: false,

  // Actions
  setExtraction: (extraction) => set({ extraction }),

  startSprint: (chunk) => {
    // Load existing notes for this chunk
    const progress = get().progress;
    const pageUrl = get().extraction?.pageUrl || '';
    const chunkProgress = progress[pageUrl]?.chunks[chunk.id];
    
    set({
      currentChunk: chunk,
      sprintStatus: 'running',
      sprintTimeRemaining: 600,
      quizAnswers: {},
      quizResults: {},
      notes: chunkProgress?.notes || '',
    });
  },

  pauseSprint: () => set({ sprintStatus: 'paused' }),

  resumeSprint: () => set({ sprintStatus: 'running' }),

  completeSprint: () => {
    const { currentChunk, quizResults, notes } = get();
    
    if (currentChunk) {
      // Calculate score
      const correct = (quizResults.mcqCorrect ? 1 : 0) + (quizResults.fillCorrect ? 1 : 0);
      const total = 2;

      // Save progress
      get().saveProgress(currentChunk.id, {
        status: 'done',
        score: { correct, total },
        notes,
      });
    }

    set({ sprintStatus: 'completed' });
  },

  resetSprint: () =>
    set({
      currentChunk: null,
      sprintStatus: 'idle',
      sprintTimeRemaining: 600,
      quizAnswers: {},
      quizResults: {},
      notes: '',
    }),

  setTimeRemaining: (seconds) => set({ sprintTimeRemaining: seconds }),

  setQuizAnswer: (type, answer) =>
    set((state) => ({
      quizAnswers: {
        ...state.quizAnswers,
        [type]: answer,
      },
    })),

  checkQuizAnswers: (correctMcq, correctFill) => {
    const { quizAnswers } = get();
    
    const mcqCorrect = quizAnswers.mcq === correctMcq;
    const fillCorrect =
      quizAnswers.fill?.toLowerCase().trim() === correctFill.toLowerCase().trim();

    set({
      quizResults: {
        mcqCorrect,
        fillCorrect,
      },
    });

    return { mcqCorrect, fillCorrect };
  },

  setNotes: (notes) => set({ notes }),

  loadProgress: async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('progress');
        if (result.progress) {
          set({ progress: result.progress });
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  },

  saveProgress: async (chunkId, chunkProgress) => {
    const { extraction, progress } = get();
    if (!extraction) return;

    const pageUrl = extraction.pageUrl;
    const existingPageProgress = progress[pageUrl] || {
      updatedAt: Date.now(),
      chunks: {},
    };

    const updatedProgress = {
      ...progress,
      [pageUrl]: {
        ...existingPageProgress,
        updatedAt: Date.now(),
        chunks: {
          ...existingPageProgress.chunks,
          [chunkId]: {
            ...existingPageProgress.chunks[chunkId],
            ...chunkProgress,
          },
        },
      },
    };

    set({ progress: updatedProgress });

    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ progress: updatedProgress });
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  getChunkProgress: (chunkId) => {
    const { extraction, progress } = get();
    if (!extraction) return undefined;

    const pageUrl = extraction.pageUrl;
    return progress[pageUrl]?.chunks[chunkId];
  },

  setPrefs: (newPrefs) =>
    set((state) => ({
      prefs: { ...state.prefs, ...newPrefs },
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));

