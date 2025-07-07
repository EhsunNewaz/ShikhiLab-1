
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ExamHeader } from './exam-header';
import { ExamFooter } from './exam-footer';
import { cn } from '@/lib/utils';
import { NotesPanel } from './notes-panel';
import { InactivityWarningDialog } from './inactivity-warning-dialog';

interface QuestionState {
  id: number;
  status: 'unanswered' | 'answered' | 'reviewed';
}

interface ExamShellProps {
  children: ReactNode;
  onTimeUp: () => void;
  isLocked: boolean;
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onToggleReview: () => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function ExamShell({
  children,
  onTimeUp,
  isLocked,
  ...footerProps
}: ExamShellProps) {
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);


  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      setShowInactivityModal(true);
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // --- Start Fullscreen ---
    // Best practice is to trigger this on a user action like a "Start Test" button.
    // For this step, we'll trigger it on mount.
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen request failed:", err);
      }
    };
    requestFullscreen();

    // --- Disable Browser Functions ---
    const handleContextMenu = (e: MouseEvent) => {
        // Prevent default right-click menu globally within the exam shell.
        // The InteractivePassage component will provide its own custom menu.
        e.preventDefault();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12 (dev tools) and ctrl+c/v/x (copy/paste/cut)
      if (e.key === 'F12' || (e.ctrlKey && ['c', 'v', 'x'].includes(e.key))) {
        e.preventDefault();
      }
    };
    
    const handleCopyPaste = (e: ClipboardEvent) => {
        e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);

    // --- Inactivity Timer ---
    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();


    // --- Cleanup ---
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      
      activityEvents.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      
      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  const handleContinue = () => {
    setShowInactivityModal(false);
    resetInactivityTimer();
  }

  return (
    <div
      className={cn('h-screen w-screen bg-[#f5f5f5] font-sans text-gray-800', {
        'pointer-events-none opacity-75': isLocked,
      })}
    >
      <ExamHeader onTimeUp={onTimeUp} onToggleNotes={() => setIsNotesPanelOpen(p => !p)} />

      {/* Main Content Area */}
      <main className="h-full overflow-y-auto bg-white pt-[60px] pb-[60px]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <ExamFooter {...footerProps} />

      {/* Popups and Overlays */}
      <NotesPanel isOpen={isNotesPanelOpen} onClose={() => setIsNotesPanelOpen(false)} />
      <InactivityWarningDialog isOpen={showInactivityModal} onContinue={handleContinue} />
    </div>
  );
}
