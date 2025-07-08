
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ExamHeader } from './exam-header';
import { cn } from '@/lib/utils';
import { NotesPanel } from './notes-panel';
import { InactivityWarningDialog } from './inactivity-warning-dialog';
import { HelpDialog } from './help-dialog';

interface ExamShellProps {
  children: ReactNode;
  onTimeUp: () => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleReview: () => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function ExamShell({
  children,
  onTimeUp,
  isSubmitted,
  onSubmit,
  onNext,
  onPrev,
  onToggleReview,
}: ExamShellProps) {
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);


  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    // Don't set new timer if test is submitted
    if (isSubmitted) return;

    inactivityTimer.current = setTimeout(() => {
      setShowInactivityModal(true);
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // --- Disable Browser Functions ---
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };
  }, []);

  // Clear timer when submitted
  useEffect(() => {
    if (isSubmitted && inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, [isSubmitted]);

  const handleContinue = () => {
    setShowInactivityModal(false);
    resetInactivityTimer();
  }

  return (
    <div
      className={cn('h-screen w-screen bg-exam-background font-exam text-exam-text', {
        'pointer-events-none opacity-75': isSubmitted,
      })}
    >
      <ExamHeader
        onTimeUp={onTimeUp}
        isSubmitted={isSubmitted}
        onSubmit={onSubmit}
        onNext={onNext}
        onPrev={onPrev}
        onToggleReview={onToggleReview}
      />

      {/* Main Content Area - with padding for header and footer */}
      <main className="h-full bg-white pt-[60px] pb-[72px]">
        {children}
      </main>


      {/* Popups and Overlays */}
      <NotesPanel isOpen={isNotesPanelOpen} onClose={() => setIsNotesPanelOpen(false)} />
      <InactivityWarningDialog isOpen={showInactivityModal} onContinue={handleContinue} />
      <HelpDialog isOpen={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </div>
  );
}
