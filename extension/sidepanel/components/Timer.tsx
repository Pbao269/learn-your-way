/**
 * Timer component
 * Displays and controls the 10-minute sprint timer
 */

import React, { useEffect, useRef } from 'react';
import { useSprintStore } from '../state/sprintStore';

const Timer: React.FC = () => {
  const { sprintStatus, sprintTimeRemaining, setTimeRemaining, pauseSprint, resumeSprint, completeSprint, currentChunk } =
    useSprintStore();
  
  const intervalRef = useRef<number | null>(null);

  // Save timer state to Chrome storage
  useEffect(() => {
    const saveTimerState = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && currentChunk) {
        await chrome.storage.local.set({ 
          lastTimerState: { 
            timeRemaining: sprintTimeRemaining, 
            status: sprintStatus,
            chunkId: currentChunk.id
          } 
        });
      }
    };
    
    // Debounce saves to avoid too many writes
    const timeoutId = setTimeout(saveTimerState, 500);
    return () => clearTimeout(timeoutId);
  }, [sprintTimeRemaining, sprintStatus, currentChunk]);

  // Load timer state on mount
  useEffect(() => {
    const loadTimerState = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && sprintStatus !== 'idle') {
        const result = await chrome.storage.local.get('lastTimerState');
        if (result.lastTimerState && currentChunk && result.lastTimerState.chunkId === currentChunk.id) {
          // Only restore if it's the same chunk
          setTimeRemaining(result.lastTimerState.timeRemaining);
        }
      }
    };
    
    loadTimerState();
  }, []); // Only run on mount

  useEffect(() => {
    if (sprintStatus === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(Math.max(0, sprintTimeRemaining - 1));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sprintStatus, sprintTimeRemaining, setTimeRemaining]);

  // Auto-complete when time reaches 0
  useEffect(() => {
    if (sprintTimeRemaining === 0 && sprintStatus === 'running') {
      completeSprint();
    }
  }, [sprintTimeRemaining, sprintStatus, completeSprint]);

  const minutes = Math.floor(sprintTimeRemaining / 60);
  const seconds = sprintTimeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Color states
  const isWarning = sprintTimeRemaining <= 180 && sprintTimeRemaining > 60; // < 3 min
  const isDanger = sprintTimeRemaining <= 60; // < 1 min

  const timerClass = isDanger
    ? 'timer-display timer-danger'
    : isWarning
    ? 'timer-display timer-warning'
    : 'timer-display';

  return (
    <div className="card text-center">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 mb-2">Sprint Timer</p>
        <div className={timerClass} role="timer" aria-live="polite" aria-atomic="true">
          {formattedTime}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        {sprintStatus === 'running' && (
          <button onClick={pauseSprint} className="btn-secondary" aria-label="Pause timer">
            ⏸ Pause
          </button>
        )}

        {sprintStatus === 'paused' && (
          <button onClick={resumeSprint} className="btn-primary" aria-label="Resume timer">
            ▶️ Resume
          </button>
        )}

        {(sprintStatus === 'running' || sprintStatus === 'paused') && (
          <button onClick={completeSprint} className="btn-secondary" aria-label="Complete sprint">
            ✓ Complete
          </button>
        )}
      </div>

      {isDanger && (
        <p className="mt-3 text-sm text-red-600 font-medium">⏰ Less than 1 minute remaining!</p>
      )}
    </div>
  );
};

export default Timer;

