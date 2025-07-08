
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import { ExamHeader } from './exam-header';
import { cn } from '@/lib/utils';
import { InactivityWarningDialog } from './inactivity-warning-dialog';
import { HelpDialog } from './help-dialog';
import { ExamSettings } from './exam-settings';
import { Button } from '../ui/button';
import { NotesPanel } from './notes-panel';
import { BottomPanel } from './bottom-panel';
import type { Annotation } from './interactive-passage';

interface QuestionState {
    id: string;
    passage: number;
    status: 'unanswered' | 'answered';
    isReviewed: boolean;
  }

interface ExamShellProps {
  children: ReactNode;
  onTimeUp: () => void;
  onSubmit: () => void;
  isSubmitted: boolean;
  questions: QuestionState[];
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleReview: () => void;
  // Props for Notes Panel
  isNotesOpen: boolean;
  onToggleNotes: () => void;
  annotations: Annotation[];
  onNoteSelect: (annotationId: string) => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function ExamShell({
  children,
  onTimeUp,
  onSubmit,
  isSubmitted,
  questions,
  currentQuestionIndex,
  onSelectQuestion,
  onPrev,
  onNext,
  onToggleReview,
  isNotesOpen,
  onToggleNotes,
  annotations,
  onNoteSelect,
}: ExamShellProps) {
  const [isScreenHidden, setIsScreenHidden] = useState(false);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
    // --- Inactivity Timer ---
    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();


    // --- Cleanup ---
    return () => {
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
        onSubmit={onSubmit}
        onToggleHelp={() => setIsHelpOpen(true)}
        onToggleSettings={() => setIsSettingsOpen(true)}
        onToggleHide={() => setIsScreenHidden(true)}
        onToggleNotes={onToggleNotes}
        isSubmitted={isSubmitted}
      />

      {/* Main Content Area - with padding for header and footer */}
      <main className="h-full bg-white pt-[60px] pb-[120px]">
        {children}
      </main>
      
      <NotesPanel 
        isOpen={isNotesOpen} 
        onClose={onToggleNotes} 
        annotations={annotations}
        onNoteSelect={onNoteSelect}
      />

      {isScreenHidden && (
          <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-4">
              <h2 className="text-2xl font-bold">Test Paused</h2>
              <p>Click the button below to resume the test.</p>
              <Button onClick={() => setIsScreenHidden(false)}>Resume Test</Button>
          </div>
      )}

      <BottomPanel
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onSelectQuestion={onSelectQuestion}
        isSubmitted={isSubmitted}
        onNext={onNext}
        onPrev={onPrev}
        onReview={onToggleReview}
      />


      {/* Popups and Overlays */}
      <InactivityWarningDialog isOpen={showInactivityModal} onContinue={handleContinue} />
      <HelpDialog isOpen={isHelpOpen} onOpenChange={setIsHelpOpen} />
      <ExamSettings isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
